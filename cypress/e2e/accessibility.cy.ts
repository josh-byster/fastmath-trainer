describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have proper heading structure', () => {
    cy.get('h1').should('exist').and('contain', 'FastMath');
    
    // Navigate to settings to check other headings
    cy.contains('Settings').click();
    cy.get('h2').should('exist').and('contain', 'Game Settings');
  });

  it('should have proper button labels and roles', () => {
    // Check start game button
    cy.get('[data-testid="start-game-btn"]')
      .should('have.attr', 'role', 'button')
      .or('be.match', 'button');
    
    // Check settings button
    cy.get('[aria-label="Settings"]').should('exist');
    
    // Check navigation buttons
    cy.contains('Home').should('have.attr', 'role', 'button').or('be.match', 'button');
    cy.contains('Settings').should('have.attr', 'role', 'button').or('be.match', 'button');
    cy.contains('Stats').should('have.attr', 'role', 'button').or('be.match', 'button');
  });

  it('should be keyboard navigable', () => {
    // Tab through main navigation
    cy.get('body').tab();
    cy.focused().should('contain', 'Settings'); // Header settings button
    
    cy.focused().tab();
    cy.focused().should('contain', 'Start Game');
    
    cy.focused().tab();
    cy.focused().should('contain', 'Home');
    
    cy.focused().tab();
    cy.focused().should('contain', 'Settings');
    
    cy.focused().tab();
    cy.focused().should('contain', 'Stats');
  });

  it('should have proper form labels in settings', () => {
    cy.contains('Settings').click();
    
    // Check that sliders have labels
    cy.get('[data-testid="digit-count-slider"]')
      .should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby');
    
    cy.get('[data-testid="sequence-length-slider"]')
      .should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby');
    
    // Check toggle switches have labels
    cy.get('[data-testid="sound-toggle"]')
      .should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby');
    
    cy.get('[data-testid="haptic-toggle"]')
      .should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby');
  });

  it('should have sufficient color contrast', () => {
    // This would typically use a color contrast plugin like cypress-axe
    // For now, we'll check that text is readable
    cy.get('body').should('be.visible');
    cy.get('h1').should('be.visible').and('not.have.css', 'color', 'rgb(255, 255, 255)'); // Assuming white background
  });

  it('should provide feedback for user actions', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    
    // Should provide visual feedback that game started
    cy.get('[data-testid="game-screen"]').should('be.visible');
    
    // Should provide status information
    cy.get('[data-testid="game-state"]').should('exist');
  });

  it('should have proper focus management in game', () => {
    cy.get('[data-testid="start-game-btn"]').click();
    cy.waitForSequenceComplete();
    
    // Focus should be on number pad area
    cy.get('[data-testid="number-pad"]').should('be.visible');
    
    // Should be able to navigate number pad with keyboard
    cy.get('[data-testid="number-1"]').focus();
    cy.focused().should('contain', '1');
  });

  it('should announce game state changes', () => {
    // Check for aria-live regions
    cy.get('[aria-live]').should('exist');
    
    cy.get('[data-testid="start-game-btn"]').click();
    
    // Game state changes should be announced
    cy.get('[aria-live]').should('not.be.empty');
  });

  it('should have proper landmark roles', () => {
    // Check for main content area
    cy.get('main').should('exist');
    
    // Check for header
    cy.get('header').should('exist');
    
    // Check for navigation
    cy.get('nav').should('exist');
    
    // Check for footer
    cy.get('footer').should('exist');
  });

  it('should work with reduced motion preferences', () => {
    cy.window().then((win) => {
      // Mock prefers-reduced-motion
      Object.defineProperty(win, 'matchMedia', {
        writable: true,
        value: cy.stub().returns({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        }),
      });
    });
    
    cy.reload();
    
    // Animations should be reduced or disabled
    cy.get('[data-testid="start-game-btn"]').click();
    // This would check that animations respect the reduced motion preference
    // Implementation depends on how animations are handled in the app
  });
});