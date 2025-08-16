describe('Settings Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Settings').click();
  });

  it('should display all settings controls', () => {
    cy.contains('Game Settings').should('be.visible');
    
    // Check for all setting controls
    cy.get('[data-testid="digit-count-slider"]').should('be.visible');
    cy.get('[data-testid="sequence-length-slider"]').should('be.visible');
    cy.get('[data-testid="time-on-screen-slider"]').should('be.visible');
    cy.get('[data-testid="time-between-slider"]').should('be.visible');
    cy.get('[data-testid="sound-toggle"]').should('be.visible');
    cy.get('[data-testid="haptic-toggle"]').should('be.visible');
  });

  it('should show default values', () => {
    cy.get('[data-testid="digit-count-slider"]').should('have.value', '2');
    cy.get('[data-testid="sequence-length-slider"]').should('have.value', '5');
    cy.get('[data-testid="time-on-screen-slider"]').should('have.value', '1000');
    cy.get('[data-testid="time-between-slider"]').should('have.value', '300');
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
    cy.get('[data-testid="haptic-toggle"]').should('be.checked');
  });

  it('should update digit count setting', () => {
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 3)
      .trigger('change');
    
    cy.get('[data-testid="digit-count-value"]').should('contain', '3');
  });

  it('should update sequence length setting', () => {
    cy.get('[data-testid="sequence-length-slider"]')
      .invoke('val', 7)
      .trigger('change');
    
    cy.get('[data-testid="sequence-length-value"]').should('contain', '7');
  });

  it('should update time on screen setting', () => {
    cy.get('[data-testid="time-on-screen-slider"]')
      .invoke('val', 1500)
      .trigger('change');
    
    cy.get('[data-testid="time-on-screen-value"]').should('contain', '1.5s');
  });

  it('should update time between numbers setting', () => {
    cy.get('[data-testid="time-between-slider"]')
      .invoke('val', 500)
      .trigger('change');
    
    cy.get('[data-testid="time-between-value"]').should('contain', '0.5s');
  });

  it('should toggle sound setting', () => {
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
    cy.get('[data-testid="sound-toggle"]').click();
    cy.get('[data-testid="sound-toggle"]').should('not.be.checked');
  });

  it('should toggle haptic setting', () => {
    cy.get('[data-testid="haptic-toggle"]').should('be.checked');
    cy.get('[data-testid="haptic-toggle"]').click();
    cy.get('[data-testid="haptic-toggle"]').should('not.be.checked');
  });

  it('should persist settings across navigation', () => {
    // Change settings
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 3)
      .trigger('change');
    cy.get('[data-testid="sound-toggle"]').click();
    
    // Navigate away and back
    cy.contains('Home').click();
    cy.contains('Settings').click();
    
    // Settings should be preserved
    cy.get('[data-testid="digit-count-slider"]').should('have.value', '3');
    cy.get('[data-testid="sound-toggle"]').should('not.be.checked');
  });

  it('should reset settings to defaults', () => {
    // Change some settings
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 3)
      .trigger('change');
    cy.get('[data-testid="sound-toggle"]').click();
    
    // Reset
    cy.get('[data-testid="reset-settings-btn"]').click();
    
    // Confirm reset dialog if it exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="confirm-reset"]').length > 0) {
        cy.get('[data-testid="confirm-reset"]').click();
      }
    });
    
    // Check defaults are restored
    cy.get('[data-testid="digit-count-slider"]').should('have.value', '2');
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
  });

  it('should validate setting ranges', () => {
    // Test minimum values
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 1)
      .trigger('change');
    cy.get('[data-testid="digit-count-value"]').should('contain', '2'); // Should enforce minimum
    
    // Test maximum values
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 5)
      .trigger('change');
    cy.get('[data-testid="digit-count-value"]').should('contain', '4'); // Should enforce maximum
  });

  it('should show difficulty indicator', () => {
    // Default settings should show easy
    cy.get('[data-testid="difficulty-indicator"]').should('contain', 'Easy');
    
    // Change to hard settings
    cy.get('[data-testid="digit-count-slider"]')
      .invoke('val', 3)
      .trigger('change');
    cy.get('[data-testid="sequence-length-slider"]')
      .invoke('val', 8)
      .trigger('change');
    cy.get('[data-testid="time-on-screen-slider"]')
      .invoke('val', 700)
      .trigger('change');
    
    cy.get('[data-testid="difficulty-indicator"]').should('contain', 'Hard');
  });
});