const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

async function runTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Веб хуудас руу орох
    await driver.get('http://localhost:3000/register');

    // Имэйл хаяг оруулах
    let emailInput = await driver.findElement(By.xpath("//input[@placeholder='Имэйл']"));
    await emailInput.sendKeys('testuser@example.com'); // Имэйл оруулах
    // Нууц үг оруулах
    let passwordInput = await driver.findElement(By.xpath("//input[@placeholder='Нууц үг']"));
    await passwordInput.sendKeys('YourSecretPassword123'); // Нууц үгийг оруулах

    // Нэр оруулах
    let nameInput = await driver.findElement(By.xpath("//input[@placeholder='Нэр']"));
    await nameInput.sendKeys('Тест'); // Нэр оруулах

    // Овог оруулах
    let surnameInput = await driver.findElement(By.xpath("//input[@placeholder='Овог']"));
    await surnameInput.sendKeys('Хэрэглэгч'); // Овог оруулах

    // Хаяг оруулах
    let addressInput = await driver.findElement(By.xpath("//input[@placeholder='Хаяг']"));
    await addressInput.sendKeys('Улаанбаатар, Монгол'); // Хаяг оруулах

    // Регистрийн дугаар оруулах
    let registerNumberInput = await driver.findElement(By.xpath("//input[@placeholder='РД дугаар']"));
    await registerNumberInput.sendKeys('123456789'); // Регистрийн дугаар оруулах

    // Утасны дугаар оруулах
    let phoneInput = await driver.findElement(By.xpath("//input[@placeholder='Утасны дугаар']"));
    await phoneInput.sendKeys('9501-0589'); // Утасны дугаар оруулах

    // `submit` товчийг олох (class атрибут ашиглан)
    let submitButton = await driver.findElement(By.css('button.button[type="submit"]'));
    await submitButton.click(); // Товчийг дарна

    // Мессежийг хүлээх (алтерантив селектор ашиглаж магадгүй)
    let resultMessage = await driver.wait(until.elementLocated(By.css('.message')), 10000).getText();
    assert.strictEqual(resultMessage, 'Утасны дугаар давхцаж байна');
    
  } finally {
    await driver.quit();
  }
}

runTest();
