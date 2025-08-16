describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the home screen by default', () => {
    cy.contains('FastMath').should('be.visible');
    cy.get('[data-testid="start-game-btn"]').should('be.visible');
  });

  it('should navigate between screens using bottom navigation', () => {
    // Navigate to Settings
    cy.contains('Settings').click();
    cy.url().should('include', '#settings');
    cy.contains('Game Settings').should('be.visible');

    // Navigate to Stats
    cy.contains('Stats').click();
    cy.url().should('include', '#stats');
    cy.contains('Statistics').should('be.visible');

    // Navigate back to Home
    cy.contains('Home').click();
    cy.url().should('include', '#home');
    cy.contains('Start Game').should('be.visible');
  });

  it('should highlight the active navigation item', () => {
    // Home should be active by default
    cy.contains('Home').should('have.class', 'active');
    cy.contains('Settings').should('not.have.class', 'active');
    cy.contains('Stats').should('not.have.class', 'active');

    // Navigate to Settings
    cy.contains('Settings').click();
    cy.contains('Settings').should('have.class', 'active');
    cy.contains('Home').should('not.have.class', 'active');
    cy.contains('Stats').should('not.have.class', 'active');
  });

  it('should navigate to settings via header settings button', () => {
    cy.get('[aria-label="Settings"]').click();
    cy.contains('Game Settings').should('be.visible');
    cy.url().should('include', '#settings');
  });

  it('should maintain navigation state on page refresh', () => {
    cy.contains('Settings').click();
    cy.reload();
    cy.contains('Game Settings').should('be.visible');
    cy.contains('Settings').should('have.class', 'active');
  });
});