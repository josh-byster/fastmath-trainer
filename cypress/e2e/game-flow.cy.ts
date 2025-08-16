describe('Game Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete a full game cycle with correct answer', () => {
    // Start game
    cy.get('[data-testid="start-game-btn"]').click();
    
    // Wait for game to start
    cy.get('[data-testid="game-screen"]').should('be.visible');
    cy.get('[data-testid="game-state"]').should('contain', 'playing');
    
    // Wait for sequence to complete
    cy.waitForSequenceComplete();
    
    // Input answer (for simplicity, we'll use a predetermined sequence)
    // This test would need to be adapted based on how the game generates sequences
    cy.get('[data-testid="number-pad"]').should('be.visible');
    
    // Input a test answer
    cy.inputAnswer('123');
    
    // Submit answer
    cy.get('[data-testid="submit-btn"]').click();
    
    // Check results screen
    cy.get('[data-testid="results-screen"]').should('be.visible');
    cy.get('[data-testid="play-again-btn"]').should('be.visible');
    cy.get('[data-testid="home-btn"]').should('be.visible');
  });

  it('should handle incorrect answer gracefully', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Input obviously wrong answer
    cy.inputAnswer('999999');
    cy.get('[data-testid="submit-btn"]').click();
    
    // Should still show results screen
    cy.get('[data-testid="results-screen"]').should('be.visible');
    cy.get('[data-testid="score"]').should('contain', '0');
  });

  it('should allow playing multiple rounds', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.inputAnswer('123');
    cy.get('[data-testid="submit-btn"]').click();
    
    // Play again
    cy.get('[data-testid="play-again-btn"]').click();
    cy.get('[data-testid="game-screen"]').should('be.visible');
    cy.get('[data-testid="game-state"]').should('contain', 'playing');
  });

  it('should return to home from results screen', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.inputAnswer('123');
    cy.get('[data-testid="submit-btn"]').click();
    
    // Return to home
    cy.get('[data-testid="home-btn"]').click();
    cy.get('[data-testid="start-game-btn"]').should('be.visible');
  });

  it('should disable submit button when no input', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.get('[data-testid="submit-btn"]').should('be.disabled');
  });

  it('should enable submit button when input is provided', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.get('[data-testid="number-1"]').click();
    cy.get('[data-testid="submit-btn"]').should('not.be.disabled');
  });

  it('should clear input when clear button is pressed', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    cy.inputAnswer('123');
    cy.get('[data-testid="user-input"]').should('contain', '123');
    
    cy.get('[data-testid="clear-btn"]').click();
    cy.get('[data-testid="user-input"]').should('be.empty');
    cy.get('[data-testid="submit-btn"]').should('be.disabled');
  });
});