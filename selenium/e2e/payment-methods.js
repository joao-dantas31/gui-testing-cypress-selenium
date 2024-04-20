const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const util = require('util');
var exec = util.promisify(require('child_process').exec);

describe('payment methods', () => {
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('firefox').build();
    const path = 'path to your volume media and sessions'
    await exec(`docker exec sylius bin/console sylius:fixtures:load -n && sudo chown -R 33:33 ${path}/media && sudo chown -R 33:33 ${path}/sessions`);
  });

  after(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    driver.manage().deleteAllCookies();
    await driver.get('http://localhost:9990/admin');
    // await driver.get('http://150.165.75.99:9990/admin');
    await driver.findElement(By.id('_username')).sendKeys('sylius');
    await driver.findElement(By.id('_password')).sendKeys('sylius');
    await driver.findElement(By.css('.primary')).click();
    // await driver.sleep(1000);
  });

  // Remove .only and implement others test cases!
  it('change cash on delivery position', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('cash');

    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();

    // Click in edit of the last payment method
    const buttons = await driver.findElements(By.css('*[class^="ui labeled icon button "]'));
    await buttons[buttons.length - 1].click();

    // Type 1 in position field
    await driver.findElement(By.id('sylius_payment_method_position')).sendKeys('1');

    // Click on Save changes button
    await driver.findElement(By.id('sylius_save_changes_button')).click();

    // Assert that payment method has been updated
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Payment method has been successfully updated.'));
  });

  it('search for a non existent payment method', async () => {
    await driver.findElement(By.linkText('Payment methods')).click();

    await driver.findElement(By.id('criteria_search_value')).sendKeys('test');
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('There are no results to display'));
  });

  it('try to clear filters after filtering', async () => {
    await driver.findElement(By.linkText('Payment methods')).click();

    await driver.findElement(By.id('criteria_search_value')).sendKeys('cash');
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();
    await driver.findElement(By.linkText('Clear filters')).click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Bank transfer'));
  });

  it('trying to search for bank transfer payment method', async () => {
    await driver.findElement(By.linkText('Payment methods')).click();

    await driver.findElement(By.id('criteria_search_value')).sendKeys('bank');

    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(!bodyText.includes('cash_on_delivery'));
  });

  it('trying to change a payment name', async () => {
    await driver.findElement(By.linkText('Payment methods')).click();

    await driver.findElement(By.id('criteria_search_value')).sendKeys('cash');

    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();

    const buttons = await driver.findElements(By.css('*[class^="ui labeled icon button "]'));
    await buttons[buttons.length - 1].click();

    await driver.findElement(By.id('sylius_payment_method_translations_en_US_name')).sendKeys('Credit card');

    await driver.findElement(By.id('sylius_save_changes_button')).click();

    await driver.findElement(By.linkText('Payment methods')).click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Credit card'));
  });

  it('create a new offline payment', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Click in the create dropdown
    await driver.findElement(By.css('*[class^="ui labeled icon top right floating dropdown button primary link"]')).click();
    // Select offline option
    await driver.findElement(By.id('offline')).click();

    // Type the code in value input
    await driver.findElement(By.id('sylius_payment_method_code')).sendKeys('test_payment');
    // Select the position
    await driver.findElement(By.id('sylius_payment_method_position')).sendKeys('2');
    // Type the us name in value input
    await driver.findElement(By.id('sylius_payment_method_translations_en_US_name')).sendKeys('test_payment_US');

    // Click on Create button
    await driver.findElement(By.css('*[class^="ui labeled icon primary button"]')).click();

    // Assert that payment method has been created
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Payment method has been successfully created.'));
  });

  it('create a new stripe payment', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Click in the create dropdown
    await driver.findElement(By.css('*[class^="ui labeled icon top right floating dropdown button primary link"]')).click();
    // Select stripe option
    await driver.findElement(By.id('stripe_checkout')).click();

    // Type the code in value input
    await driver.findElement(By.id('sylius_payment_method_code')).sendKeys('test_payment_2');
    // Select the position
    await driver.findElement(By.id('sylius_payment_method_position')).sendKeys('3');
    // Type the us name in value input
    await driver.findElement(By.id('sylius_payment_method_translations_en_US_name')).sendKeys('test_payment_2_US');

    // Type the publishable key in value input
    await driver.findElement(By.id('sylius_payment_method_gatewayConfig_config_publishable_key')).sendKeys('123');
    // Type the secret key in value input
    await driver.findElement(By.id('sylius_payment_method_gatewayConfig_config_secret_key')).sendKeys('123');

    // Click on Create button
    await driver.findElement(By.css('*[class^="ui labeled icon primary button"]')).click();

    // Assert that payment method has been created
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Payment method has been successfully created.'));
  });

  it('disable a existent payment', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('bank');
    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();
    // Click in edit of the last payment method
    const buttons = await driver.findElements(By.css('*[class^="ui labeled icon button"]'));
    await buttons[buttons.length - 1].click();

    // Change the payment enable checkbox to false
    const checkboxes = await driver.findElements(By.css('*[class^="ui toggle checkbox"]'));
    await checkboxes[0].click();
    // Click on Save changes button
    await driver.findElement(By.id('sylius_save_changes_button')).click();

    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();
    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('bank');
    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();

    // Assert that payment method has been changed to disable
    const tableText = await driver.findElement(By.css('*[class^="ui sortable stackable very basic celled table"]')).getText();
    assert(tableText.includes('Disabled'));
  });

  it('removing a used payment', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('cash');
    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();
    // Click in edit of the last payment method
    const buttons = await driver.findElements(By.css('*[class^="ui red labeled icon button"]'));
    await buttons[1].click();
    // Click in confirm button
    await driver.findElement(By.id('confirmation-button')).click();

    // Assert that payment method has not been deleted
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Cannot delete, the Payment method is in use.'));
  });

  it('removing a non used payment', async () => {
    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();

    // Click in the create dropdown
    await driver.findElement(By.css('*[class^="ui labeled icon top right floating dropdown button primary link"]')).click();
    // Select offline option
    await driver.findElement(By.id('offline')).click();

    // Type the code in value input
    await driver.findElement(By.id('sylius_payment_method_code')).sendKeys('removed_payment');
    // Type the us name in value input
    await driver.findElement(By.id('sylius_payment_method_translations_en_US_name')).sendKeys('test_remove_payment_US');
    // Click on Create button
    await driver.findElement(By.css('*[class^="ui labeled icon primary button"]')).click();

    // Click in payment methods in side menu
    await driver.findElement(By.linkText('Payment methods')).click();
    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('removed_payment');
    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();
    // Click in edit of the last payment method
    const buttons = await driver.findElements(By.css('*[class^="ui red labeled icon button"]'));
    await buttons[1].click();
    // Click in confirm button
    await driver.findElement(By.id('confirmation-button')).click();

    // Assert that payment method has been deleted
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Payment method has been successfully deleted.'));

    // Type in value input to search for specify payment method
    await driver.findElement(By.id('criteria_search_value')).sendKeys('removed_payment');
    // Click in filter blue button
    await driver.findElement(By.css('*[class^="ui blue labeled icon button"]')).click();
    // Assert that payment does not exist
    const bodyText2 = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText2.includes('There are no results to display'));
  });
});
