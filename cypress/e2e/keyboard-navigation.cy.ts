describe('Keyboard Navigation and Input', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should handle keyboard input during game', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Type numbers using keyboard
    cy.get('body').type('1');
    cy.get('[data-testid="user-input"]').should('contain', '1');
    
    cy.get('body').type('2');
    cy.get('[data-testid="user-input"]').should('contain', '12');
    
    cy.get('body').type('3');
    cy.get('[data-testid="user-input"]').should('contain', '123');
  });

  it('should handle backspace and delete keys', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Type some numbers
    cy.get('body').type('123');
    cy.get('[data-testid="user-input"]').should('contain', '123');
    
    // Use backspace to clear entire input
    cy.get('body').type('{backspace}');
    cy.get('[data-testid="user-input"]').should('contain', '0');
  });

  it('should handle escape key for clearing input', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.get('body').type('123');
    cy.get('[data-testid="user-input"]').should('contain', '123');
    
    cy.get('body').type('{esc}');
    cy.get('[data-testid="user-input"]').should('contain', '0');
  });

  it('should handle enter key for submitting answer', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.get('body').type('123');
    cy.get('body').type('{enter}');
    
    // Should navigate to results screen
    cy.get('[data-testid="results-screen"]').should('be.visible');
  });

  it('should not submit empty answer with enter key', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Try to submit without entering anything
    cy.get('body').type('{enter}');
    
    // Should remain on game screen
    cy.get('[data-testid="game-screen"]').should('be.visible');
    cy.get('[data-testid="results-screen"]').should('not.exist');
  });

  it('should handle number keys correctly', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Test all number keys
    for (let i = 0; i <= 9; i++) {
      cy.get('body').type(i.toString());
      cy.get('[data-testid="user-input"]').should('contain', i.toString());
      cy.get('body').type('{esc}'); // Clear for next test
    }
  });

  it('should ignore non-numeric keys during input', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Try typing letters and symbols
    cy.get('body').type('abc!@#');
    cy.get('[data-testid="user-input"]').should('contain', '0');
    
    // Numbers should still work
    cy.get('body').type('123');
    cy.get('[data-testid="user-input"]').should('contain', '123');
  });

  it('should handle rapid key presses', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Rapid number input
    cy.get('body').type('1234567890', { delay: 10 });
    cy.get('[data-testid="user-input"]').should('contain', '1234567890');
  });

  it('should handle keyboard navigation in settings', () => {
    cy.get('.nav-btn').contains('Settings').click();
    
    // Tab through settings controls
    cy.get('[data-testid="time-on-screen-slider"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'time-on-screen-slider');
    
    // Use arrow keys to change slider value
    cy.focused().type('{rightarrow}');
    
    // Tab to next control
    cy.focused().realPress('Tab');
    cy.focused().should('have.attr', 'data-testid', 'time-between-slider');
  });

  it('should handle space bar for toggles in settings', () => {
    cy.get('.nav-btn').contains('Settings').click();
    
    cy.get('[data-testid="sound-toggle"]').focus();
    
    // Check initial state (assuming default is true)
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
    
    // Use space to toggle
    cy.focused().type(' ');
    cy.get('[data-testid="sound-toggle"]').should('not.be.checked');
    
    // Toggle back
    cy.focused().type(' ');
    cy.get('[data-testid="sound-toggle"]').should('be.checked');
  });

  it('should maintain focus after game completion', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.get('body').type('123{enter}');
    
    // Focus should be on results screen action buttons
    cy.get('[data-testid="play-again-btn"]').should('be.visible');
    cy.get('[data-testid="home-btn"]').should('be.visible');
    
    // Should be able to navigate with keyboard
    cy.get('[data-testid="play-again-btn"]').focus();
    cy.focused().should('contain', 'Play Again');
    
    cy.focused().realPress('Tab');
    cy.focused().should('contain', 'Return Home');
  });

});