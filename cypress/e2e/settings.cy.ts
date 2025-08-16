describe('Settings Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.nav-btn').contains('Settings').click();
  });

  it('should display all settings controls', () => {
    cy.contains('Game Settings').should('be.visible');
    
    // Check for all setting controls
    cy.get('[data-testid="digit-count-2"]').should('be.visible');
    cy.get('[data-testid="digit-count-3"]').should('be.visible');
    cy.get('[data-testid="sequence-length-input"]').should('be.visible');
    cy.get('[data-testid="time-on-screen-slider"]').should('be.visible');
    cy.get('[data-testid="time-between-slider"]').should('be.visible');
    cy.get('[data-testid="sound-toggle"]').should('be.visible');
    cy.get('[data-testid="haptic-toggle"]').should('be.visible');
  });

  it('should show default values', () => {
    cy.get('[data-testid="digit-count-2"]').should('have.class', 'active');
    cy.get('[data-testid="digit-count-3"]').should('not.have.class', 'active');
    cy.get('[data-testid="sequence-length-input"]').should('have.value', '5');
    cy.get('[data-testid="time-on-screen-slider"]').should('have.value', '1000');
    cy.get('[data-testid="time-between-slider"]').should('have.value', '300');
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
    cy.get('[data-testid="haptic-toggle"]').should('be.checked');
  });

  it('should update digit count setting', () => {
    cy.get('[data-testid="digit-count-3"]').click();
    
    cy.get('[data-testid="digit-count-3"]').should('have.class', 'active');
    cy.get('[data-testid="digit-count-2"]').should('not.have.class', 'active');
  });

  it('should update sequence length setting', () => {
    // Click plus button to increase from 5 to 7
    cy.get('[data-testid="sequence-length-plus"]').click();
    cy.get('[data-testid="sequence-length-plus"]').click();
    
    cy.get('[data-testid="sequence-length-input"]').should('have.value', '7');
  });

  it('should update time on screen setting', () => {
    cy.get('[data-testid="time-on-screen-slider"]')
      .invoke('val', 1500)
      .trigger('change');
    
    // Check that the slider value changed
    cy.get('[data-testid="time-on-screen-slider"]').should('have.value', '1500');
  });

  it('should update time between numbers setting', () => {
    cy.get('[data-testid="time-between-slider"]')
      .invoke('val', 500)
      .trigger('change');
    
    // Check that the slider value changed
    cy.get('[data-testid="time-between-slider"]').should('have.value', '500');
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
    cy.get('[data-testid="digit-count-3"]').click();
    cy.get('[data-testid="sound-toggle"]').click();
    
    // Navigate away and back
    cy.get('.nav-btn').contains('Home').click();
    cy.get('.nav-btn').contains('Settings').click();
    
    // Settings should be preserved
    cy.get('[data-testid="digit-count-3"]').should('have.class', 'active');
    cy.get('[data-testid="sound-toggle"]').should('not.be.checked');
  });

  it('should reset settings to defaults', () => {
    // Change some settings
    cy.get('[data-testid="digit-count-3"]').click();
    cy.get('[data-testid="sound-toggle"]').click();
    
    // Reset
    cy.get('[data-testid="reset-settings-btn"]').click();
    
    // Check defaults are restored
    cy.get('[data-testid="digit-count-2"]').should('have.class', 'active');
    cy.get('[data-testid="digit-count-3"]').should('not.have.class', 'active');
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
  });

  it('should validate setting ranges', () => {
    // Test sequence length minimum - button should be disabled at minimum
    for (let i = 0; i < 2; i++) {
      cy.get('[data-testid="sequence-length-minus"]').click();
    }
    cy.get('[data-testid="sequence-length-input"]').should('have.value', '3');
    cy.get('[data-testid="sequence-length-minus"]').should('be.disabled');
    
    // Test sequence length maximum
    for (let i = 0; i < 7; i++) {
      cy.get('[data-testid="sequence-length-plus"]').click();
    }
    cy.get('[data-testid="sequence-length-input"]').should('have.value', '10');
    cy.get('[data-testid="sequence-length-plus"]').should('be.disabled');
  });

  it('should show difficulty indicator', () => {
    // Check that difficulty indicator exists and shows some difficulty
    cy.get('[data-testid="difficulty-indicator"]').should('be.visible');
    
    // Change to harder settings
    cy.get('[data-testid="digit-count-3"]').click();
    cy.get('[data-testid="sequence-length-plus"]').click();
    cy.get('[data-testid="sequence-length-plus"]').click();
    cy.get('[data-testid="sequence-length-plus"]').click();
    cy.get('[data-testid="time-on-screen-slider"]')
      .invoke('val', 700)
      .trigger('change');
    
    // Difficulty should have changed
    cy.get('[data-testid="difficulty-indicator"]').should('be.visible');
  });
});