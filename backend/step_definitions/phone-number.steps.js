const { Given, When, Then } = require('cucumber');

let phoneNumber = '';

// Step 1: Би утасны дугаарыг "99887766" гэж орууллаа
Given('Би утасны дугаарыг {string} гэж орууллаа', function (string) {
  phoneNumber = string;
});

// Step 2: Би утасны дугаарыг стандартаар шалгана
When('Би утасны дугаарыг стандартаар шалгана', function () {
  const phoneRegex = /^\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error('Утасны дугаар зөвшөөрөгдөхгүй');
  }
});

// Step 3: Би "Утасны дугаар зөвшөөрөгдсөн" гэж хүлээж авна
Then('Би {string} гэж хүлээж авна', function (expectedResult) {
  if (expectedResult === 'Утасны дугаар зөвшөөрөгдсөн') {
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Утасны дугаар зөвшөөрөгдөхгүй');
    }
  } else if (expectedResult === 'Алдаа: Энэ утасны дугаар аль хэдийн орсон байна') {
    // Давхардуулсан утасны дугаарыг шалгах
    if (phoneNumber === '99887766') {
      throw new Error('Энэ дугаар давхардуулсан байна');
    }
  }
});
