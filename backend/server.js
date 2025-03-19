import express from 'express';
import { hash, compare } from 'bcryptjs';
import pkg from 'jsonwebtoken';
import cors from 'cors';
import database from './database.js';
import { config } from 'dotenv';
import crypto from 'crypto';

config();
const { sign } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const normalizePhoneNumber = (phone) => {
  // Утасны дугаарыг бүх зай, хипен, товчийг хасна
  return phone.replace(/[-\s]/g, '').trim();
};

const validatePhone = (phone) => {
  const normalizedPhone = normalizePhoneNumber(phone);
  // Утасны дугаарыг шалгах: 8 орон эсвэл 3-3-4 хэлбэртэй байх
  return /^(?:\d{8}|\d{9})$/.test(normalizedPhone);
};

// const normalizeAddress = (address) => {
//   // Хаягийн бүх том үсгийг жижиг үсгээр болгох
//   address = address.toLowerCase();
//   // Хаягийн үсгийн зарим товчилсон хэлбэрийг стандартад оруулах
//   address = address.replace(/схд/g, 'сонгинохайрхан дүүрэг');
//   address = address.replace(/(\d+)-(\d+)/g, '$1 $2'); // Хаягийн тоог стандарт болгох

//   return address.trim();
// };

// const validateAddress = (address) => {
//   const normalizedAddress = normalizeAddress(address);
//   // Хаягийн формат: Сонгинохайрхан дүүрэг 12-р хороо 1-12 гэх мэт
//   return /^[\w\s]+ \d+-р хороо \d+-\d+$/.test(normalizedAddress);
// };




const encryptData = (data, secret) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
};

const decryptData = (encryptedData, secret) => {
  const [saltHex, ivHex, encrypted] = encryptedData.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');

  const key = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const validateEmail = (email) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
const validateCyrillic = (text) => /^[\u0400-\u04FF0-9\s.,!?-]+$/.test(text);

app.post('/register', async (req, res) => {
  const { email, password, name, surname, address, phone, registerNumber } = req.body;

  if (!validateEmail(email)) return res.status(400).json({ message: 'Имэйл зөвхөн латин үсгээр бичигдэнэ.' });
  if (!validateCyrillicFields([name, surname, address, registerNumber])) {
    return res.status(400).json({ message: 'Нэр, овог, хаяг, регистрийн дугаар зөвхөн кирилл үсгээр бичигдэнэ.' });
  }
  if (!areAllFieldsFilled([email, password, name, surname, address, phone, registerNumber])) {
    return res.status(400).json({ message: 'Бүх талбарыг бөглөнө үү.' });
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!validatePhone(normalizedPhone)) return res.status(400).json({ message: 'Утасны дугаар зөв байх ёстой.' });

  // const normalizedAddress = normalizeAddress(address);
  // if (!validateAddress(normalizedAddress)) return res.status(400).json({ message: 'Хаягийн формат зөв байх ёстой.' });

  try {
    const duplicateCheckResult = await checkForDuplicates({ phone: normalizedPhone, registerNumber, address: address, name, surname });
    if (duplicateCheckResult) return res.status(400).json({ message: duplicateCheckResult });

    const hashedPassword = await hash(password, 10);
    const encryptionKey = crypto.createHash('sha256').update(password).digest('hex');
    const encryptedData = encryptUserData({ email, name, surname, address: address, phone: normalizedPhone, registerNumber }, encryptionKey);

    saveUserToDatabase(res, encryptedData, hashedPassword, encryptionKey);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Бүртгэл үүсгэхэд алдаа гарлаа.' });
  }
});

const validateCyrillicFields = (fields) => {
  return fields.every(validateCyrillic);
};

const areAllFieldsFilled = (fields) => {
  return fields.every(Boolean);
};

const saveUserToDatabase = (res, encryptedData, hashedPassword, encryptionKey) => {
  database.run(
    `INSERT INTO users (email, password, encryptionKey, name, surname, address, phone, registerNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [encryptedData.encryptedEmail, hashedPassword, encryptionKey, encryptedData.encryptedName, encryptedData.encryptedSurname, encryptedData.encryptedAddress, encryptedData.encryptedPhone, encryptedData.encryptedRegisterNumber],
    function (err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(400).json({ message: 'Бүртгэл үүсгэхэд алдаа гарлаа.' });
      }
      res.status(201).json({ message: 'Бүртгэл амжилттай!' });
    }
  );
};

const encryptUserData = (userData, encryptionKey) => {
  const encryptedData = {};
  for (const key in userData) {
    encryptedData[`encrypted${key.charAt(0).toUpperCase() + key.slice(1)}`] = encryptData(userData[key], encryptionKey);
  }
  return encryptedData;
};

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  database.all(`SELECT * FROM users`, async (err, users) => {
    if (isInvalidUsersList(err, users)) {
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна.' });
    }

    let foundUser = null;

    for (let user of users) {
      try {
        const decryptedEmail = decryptData(user.email, user.encryptionKey);
        console.log('Decrypted Email:', decryptedEmail);
        if (decryptedEmail === email) {
          foundUser = user;
          break;
        }
      } catch (e) {
        console.error('Decryption error:', e);
      }
    }

    if (!foundUser) return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна.' });

    console.log('Entered Password:', password);
    console.log('Stored Hashed Password:', foundUser.password);

    const isMatch = await compare(password, foundUser.password);
    if (!isMatch) return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна.' });

    const token = sign({ id: foundUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: foundUser.id } });
  });
});

function isInvalidUsersList(err, users) {
  return err || !Array.isArray(users) || users.length === 0;
}


const checkForDuplicates = async ({ phone: normalizedPhone, registerNumber, address, name, surname }) => {
  const columns = { phone: normalizedPhone, registerNumber, address, name, surname };

  // Бүх хэрэглэгчийн мэдээллийг авна
  const users = await getAllUsers();

  // Бүх хэрэглэгчийн мэдээллийг задлаад давхардлыг шалгана
  for (let user of users) {
    const decryptedPhone = decryptData(user.phone, user.encryptionKey);
    const decryptedRegisterNumber = decryptData(user.registerNumber, user.encryptionKey);
    const decryptedAddress = decryptData(user.address, user.encryptionKey);
    const decryptedName = decryptData(user.name, user.encryptionKey);
    const decryptedSurname = decryptData(user.surname, user.encryptionKey);

    if (decryptedPhone === normalizedPhone) {
      return 'Утасны дугаар давхцаж байна.';
    }

    if (decryptedRegisterNumber === registerNumber) {
      return 'Регистрийн дугаар давхцаж байна.';
    }

    if (decryptedAddress === address) {
      return 'Гэрийн хаяг давхцаж байна.';
    }

    if (decryptedName === name && decryptedSurname === surname) {
      return 'Эцгийн нэр болон өөрийн нэр давхцаж байна.';
    }
  }

  return null;
};

// Бүх хэрэглэгчийн мэдээллийг авах функц
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    database.all('SELECT id, encryptionKey, phone, registerNumber, address, name, surname FROM users', (err, users) => {
      if (err) return reject(err);
      resolve(users);
    });
  });
};

// Dashboard Endpoint - Decrypt User Data
app.post('/dashboard/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); // Get ID from URL parameters

  if (!id) {
    return res.status(400).json({ message: 'ID шаардлагатай.' });
  }

  try {
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй.' });
    }

    const decryptedUser = decryptUser(user);
    res.json(decryptedUser);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Алдаа гарлаа.' });
  }
});

const getUserById = async (id) => {
  return new Promise((resolve, reject) => {
    database.get(
      `SELECT encryptionKey, name, surname, address, phone, registerNumber FROM users WHERE id = ?`,
      [id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(user);
        }
      }
    );
  });
};

const decryptUser = (user) => {
  if (!user.encryptionKey) {
    console.warn(`Хэрэглэгч ${user.id} шифрлэлийн түлхүүргүй байна.`);
    return {
      name: user.name || "N/A",
      surname: user.surname || "N/A",
      address: user.address || "N/A",
      phone: user.phone || "N/A",
      registerNumber: user.registerNumber || "N/A",
    };
  }

  return {
    name: decryptData(user.name, user.encryptionKey),
    surname: decryptData(user.surname, user.encryptionKey),
    address: decryptData(user.address, user.encryptionKey),
    phone: decryptData(user.phone, user.encryptionKey),
    registerNumber: decryptData(user.registerNumber, user.encryptionKey),
  };
};
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
