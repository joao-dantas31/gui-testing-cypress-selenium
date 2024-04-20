describe('payment methods', () => {
    beforeEach(() => {
        cy.visit('/admin');
        cy.get('[id="_username"]').type('sylius');
        cy.get('[id="_password"]').type('sylius');
        cy.get('.primary').click();
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
        cy.get('*[class^="ui labeled icon button"]').last().click();
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
});
