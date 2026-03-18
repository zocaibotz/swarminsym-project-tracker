Feature: Project tracker end-to-end journeys
  As a project manager
  I want to manage projects across full lifecycle
  So that all delivery context is visible in one timeline

  Background:
    Given I open the project tracker application

  Scenario: Create a new project
    When I create a project named "Apollo Revamp"
    Then I should see project "Apollo Revamp" in the project summary

  Scenario: Add phases to a project
    Given project "Apollo Revamp" exists
    When I add phases to "Apollo Revamp":
      | Discovery |
      | Build     |
      | Launch    |
    Then I should see 3 phases for "Apollo Revamp"

  Scenario: Log architecture decisions
    Given project "Apollo Revamp" exists
    When I log decision "Use Playwright for E2E coverage" for "Apollo Revamp"
    Then I should see decision "Use Playwright for E2E coverage" under "Apollo Revamp"

  Scenario: Report production problems
    Given project "Apollo Revamp" exists
    When I report problem "Intermittent login timeout" for "Apollo Revamp"
    Then I should see problem "Intermittent login timeout" under "Apollo Revamp"

  Scenario: Add resolutions for reported problems
    Given project "Apollo Revamp" exists
    And problem "Intermittent login timeout" exists for "Apollo Revamp"
    When I add resolution "Increase upstream timeout and add retry" for problem "Intermittent login timeout"
    Then I should see resolution "Increase upstream timeout and add retry" linked to problem "Intermittent login timeout"
