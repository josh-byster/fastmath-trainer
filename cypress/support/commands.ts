/// <reference types="cypress" />

// Custom commands for FastMath app testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Start a new game with default or custom settings
       */
      startGame(settings?: {
        digitCount?: number;
        sequenceLength?: number;
        timeOnScreen?: number;
        timeBetween?: number;
      }): Chainable<Element>;

      /**
       * Navigate to a specific screen in the app
       */
      navigateToScreen(screen: 'home' | 'settings' | 'stats'): Chainable<Element>;

      /**
       * Input an answer using the number pad
       */
      inputAnswer(answer: string): Chainable<Element>;

      /**
       * Wait for a sequence to complete displaying
       */
      waitForSequenceComplete(): Chainable<Element>;

      /**
       * Check if the game is in a specific state
       */
      checkGameState(state: 'ready' | 'playing' | 'input' | 'results'): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('startGame', (settings = {}) => {
  cy.get('[data-testid="start-game-btn"]').click();
  
  if (Object.keys(settings).length > 0) {
    // Navigate to settings first if custom settings provided
    cy.navigateToScreen('settings');
    
    if (settings.digitCount) {
      cy.get('[data-testid="digit-count-slider"]').invoke('val', settings.digitCount).trigger('change');
    }
    if (settings.sequenceLength) {
      cy.get('[data-testid="sequence-length-slider"]').invoke('val', settings.sequenceLength).trigger('change');
    }
    if (settings.timeOnScreen) {
      cy.get('[data-testid="time-on-screen-slider"]').invoke('val', settings.timeOnScreen).trigger('change');
    }
    if (settings.timeBetween) {
      cy.get('[data-testid="time-between-slider"]').invoke('val', settings.timeBetween).trigger('change');
    }
    
    cy.navigateToScreen('home');
    cy.get('[data-testid="start-game-btn"]').click();
  }
});

Cypress.Commands.add('navigateToScreen', (screen: string) => {
  cy.get(`[data-testid="nav-${screen}"]`).click();
});

Cypress.Commands.add('inputAnswer', (answer: string) => {
  for (const digit of answer) {
    cy.get(`[data-testid="number-${digit}"]`).click();
  }
});

Cypress.Commands.add('waitForSequenceComplete', () => {
  cy.get('[data-testid="game-state"]').should('contain', 'input');
});

Cypress.Commands.add('checkGameState', (state: string) => {
  cy.get('[data-testid="game-state"]').should('contain', state);
});