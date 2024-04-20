describe('payment methods', () => {
  before(() => {
    const path = 'path to your volume media and sessions'
    cy.exec(`docker exec sylius bin/console sylius:fixtures:load -n && sudo chown -R 33:33 ${path}/media && sudo chown -R 33:33 ${path}/sessions`, { failOnNonZeroExit: false })
  })

  beforeEach(() => {
    cy.login('sylius', 'sylius');
  });

  // Remove .only and implement others test cases!
  it('change cash on delivery position', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');
    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('cash');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Click in edit of the last payment method
    cy.get('*[class^="ui labeled icon button "]').last().click();
    // Type 1 in position field
    cy.get('[id="sylius_payment_method_position"]').type('1');
    // Click on Save changes button
    cy.get('[id="sylius_save_changes_button"]').scrollIntoView().click();

    // Assert that payment method has been updated
    cy.get('body').should('contain', 'Payment method has been successfully updated.');
  });

  it('search for bank_transfer payment method', () => {
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    cy.get('[id="criteria_search_value"]').type('bank_transfer');

    cy.get('*[class^="ui blue labeled icon button"]').click();

    cy.get('tbody').should('have.length', 1);
  });

  it('trying to clear filters after the search', () => {
    cy.debug();
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    cy.get('[id="criteria_search_value"]').type('bank_transfer');

    cy.get('*[class^="ui blue labeled icon button"]').click();

    cy.clickInFirst('*[class^="ui labeled icon button"]');

    cy.get('tbody').should('contain', 'Cash on delivery');
    cy.get('tbody').should('contain', 'Bank transfer');
  });

  it('trying to change the payment name', () => {
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    cy.get('[id="criteria_search_value"]').type('bank_transfer');

    cy.get('*[class^="ui blue labeled icon button"]').click();

    cy.get('*[class^="ui labeled icon button"]').last().click();

    cy.get('[id="sylius_payment_method_translations_en_US_name"]').type('Credit card');

    cy.get('[id="sylius_save_changes_button"]').scrollIntoView().click();

    cy.get('body').should('contain', 'Payment method has been successfully updated.');

    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    cy.get('body').should('contain', 'Credit card');
  })

  it('try searching for a non existent payment method', () => {
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    cy.get('[id="criteria_search_value"]').type('test');

    cy.get('*[class^="ui blue labeled icon button"]').click();

    cy.get('body').should('contain', 'There are no results to display');
  });

  it('create a new offline payment', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    // Click in the create dropdown
    cy.get('*[class^="ui labeled icon top right floating dropdown button primary link"]').click();
    // Select offline option
    cy.get('[id="offline"]').click();

    // Type the code in value input
    cy.get('[id="sylius_payment_method_code"]').type('test_payment');
    // Select the position
    cy.get('[id="sylius_payment_method_position"]').type('2');
    // Type the us name in value input
    cy.get('[id="sylius_payment_method_translations_en_US_name"]').type('test_payment_US');

    // Click on Create button
    cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();

    // Assert that payment method has been created
    cy.get('body').should('contain', 'Payment method has been successfully created.');
  });

  it('create a new stripe payment', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    // Click in the create dropdown
    cy.get('*[class^="ui labeled icon top right floating dropdown button primary link"]').click();
    // Select stripe option
    cy.get('[id="stripe_checkout"]').click();

    // Type the code in value input
    cy.get('[id="sylius_payment_method_code"]').type('test_payment_2');
    // Select the position
    cy.get('[id="sylius_payment_method_position"]').type('3');
    // Type the us name in value input
    cy.get('[id="sylius_payment_method_translations_en_US_name"]').type('test_payment_2_US');

    // Type the publishable key in value input
    cy.get('[id="sylius_payment_method_gatewayConfig_config_publishable_key"]').type('123');
    // Type the secret key in value input
    cy.get('[id="sylius_payment_method_gatewayConfig_config_secret_key"]').type('123');

    // Click on Create button
    cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();

    // Assert that payment method has been created
    cy.get('body').should('contain', 'Payment method has been successfully created.');
  });

  it('disable a existent payment', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');
    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('bank');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Click in edit of the last payment method
    cy.get('*[class^="ui labeled icon button "]').last().click();

    // Change the payment enable checkbox to false
    cy.get('*[class^="ui toggle checkbox"]').first().click();
    // Click on Save changes button
    cy.get('[id="sylius_save_changes_button"]').scrollIntoView().click();

    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');
    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('bank');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();

    // Assert that payment method has been changed to disable
    cy.get('*[class^="ui sortable stackable very basic celled table"]').should('contain', 'Disabled');
  });

  it('removing a used payment', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');
    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('cash');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Click in edit of the last payment method
    cy.get('*[class^="ui red labeled icon button"]').eq(1).click();
    // Click in confirm button
    cy.get('[id="confirmation-button"]').click();

    // Assert that payment method has not been deleted
    cy.get('body').should('contain', 'Cannot delete, the Payment method is in use.');
  });

  it('removing a non used payment', () => {
    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');

    // Click in the create dropdown
    cy.get('*[class^="ui labeled icon top right floating dropdown button primary link"]').click();
    // Select offline option
    cy.get('[id="offline"]').click();

    // Type the code in value input
    cy.get('[id="sylius_payment_method_code"]').type('removed_payment');
    // Type the us name in value input
    cy.get('[id="sylius_payment_method_translations_en_US_name"]').type('test_remove_payment_US');
    // Click on Create button
    cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();

    // Click in payment methods in side menu
    cy.clickInFirst('a[href="/admin/payment-methods/"]');
    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('removed_payment');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Click in edit of the last payment method
    cy.get('*[class^="ui red labeled icon button"]').eq(1).click();
    // Click in confirm button
    cy.get('[id="confirmation-button"]').click();

    // Assert that payment method has been deleted
    cy.get('body').should('contain', 'Payment method has been successfully deleted.');

    // Type in value input to search for specify payment method
    cy.get('[id="criteria_search_value"]').type('removed_payment');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Assert that payment does not exist
    cy.get('body').should('contain', 'There are no results to display');
  });
});