import { defineMessages } from 'react-intl';

import { AppLabSetupItemId } from './setup.type';

export const welcomeMessages = defineMessages({
  title: {
    id: 'appLabSetup.welcome.title',
    defaultMessage: 'Welcome to Arduino App Lab',
    description: 'Title for the welcome section of the App Lab setup',
  },
  description: {
    id: 'appLabSetup.welcome.description',
    defaultMessage: 'Connect your Arduino UNO Q to start',
    description: 'Description for the welcome section of the App Lab setup',
  },
  descriptionMultipleBoards: {
    id: 'appLabSetup.welcome.descriptionMultipleBoards',
    defaultMessage: 'Multiple boards are connected, please select one to start',
    description:
      'Description for the welcome section of the App Lab setup when multiple boards are connected',
  },
  connected: {
    id: 'appLabSetup.welcome.connected',
    defaultMessage: 'Connected',
    description: 'Message indicating that the board is connected',
  },
  noDevice: {
    id: 'appLabSetup.welcome.noDevice',
    defaultMessage: 'No device',
    description: 'Message indicating that no device is connected',
  },
  connectYourBoard: {
    id: 'appLabSetup.welcome.connectYourBoard',
    defaultMessage: 'Connect board',
    description: 'Message prompting the user to connect their board',
  },
  connectYourBoardDescription: {
    id: 'appLabSetup.welcome.connectYourBoardDescription',
    defaultMessage: 'Waiting for a board to be connected',
    description: 'Description for the connect your board message',
  },
});

export const setupMessages = defineMessages<AppLabSetupItemId>({
  [AppLabSetupItemId.BoardConfiguration]: {
    id: 'appLabSetup.boardConfiguration',
    defaultMessage: 'Board Configuration',
    description: 'Board Configuration',
  },
  [AppLabSetupItemId.NetworkSetup]: {
    id: 'appLabSetup.networkSetup',
    defaultMessage: 'Network Setup',
    description: 'Network Setup',
  },
  [AppLabSetupItemId.LinuxCredentials]: {
    id: 'appLabSetup.linuxCredentials',
    defaultMessage: 'Linux Credentials',
    description: 'Linux Credentials',
  },
  [AppLabSetupItemId.ArduinoAccount]: {
    id: 'appLabSetup.arduinoAccount',
    defaultMessage: 'Arduino Account',
    description: 'Arduino Account',
  },
});

export const boardConfigurationMessages = defineMessages({
  keyboardLabel: {
    id: 'appLabSetup.boardConfiguration.keyboardLabel',
    defaultMessage: 'Keyboard Layout',
    description: 'Label for the keyboard layout input field',
  },
  nameLabel: {
    id: 'appLabSetup.boardConfiguration.nameLabel',
    defaultMessage: 'Board Name',
    description: 'Label for the board name input field',
  },
  boardConfigurationError: {
    id: 'appLabSetup.boardConfiguration.boardConfigurationError',
    defaultMessage: 'Error setting board configuration',
    description:
      'Message displayed when there is an error setting the board configuration',
  },
  boardConfigurationSuccess: {
    id: 'appLabSetup.boardConfiguration.boardConfigurationSuccess',
    defaultMessage: 'Board configuration set successfully',
    description:
      'Message displayed when the board configuration is set successfully',
  },
});

export const linuxCredentialsMessages = defineMessages({
  descriptionLabel: {
    id: 'appLabSetup.linuxCredentials.descriptionLabel',
    defaultMessage: 'Select a password for your Linux account',
    description: 'Description for the linux credentials setup section',
  },
  usernameLabel: {
    id: 'appLabSetup.linuxCredentials.usernameLabel',
    defaultMessage: 'Username',
    description: 'Label for the username input field',
  },
  passwordLabel: {
    id: 'appLabSetup.linuxCredentials.passwordLabel',
    defaultMessage: 'Password',
    description: 'Label for the password input field',
  },
  passwordConfirmationLabel: {
    id: 'appLabSetup.linuxCredentials.passwordConfirmationLabel',
    defaultMessage: 'Confirm Password',
    description: 'Label for the password confirmation input field',
  },
  linuxCredentialsError: {
    id: 'appLabSetup.linuxCredentials.linuxCredentialsError',
    defaultMessage: 'Error setting user credentials',
    description:
      'Message displayed when there is an error setting the user credentials',
  },
  linuxCredentialsSuccess: {
    id: 'appLabSetup.linuxCredentials.linuxCredentialsSuccess',
    defaultMessage: 'User credentials set successfully',
    description:
      'Message displayed when the user credentials are set successfully',
  },
});

export const sectionTitleMessages = defineMessages<AppLabSetupItemId>({
  [AppLabSetupItemId.BoardConfiguration]: {
    id: 'appLabSetup.boardName.title',
    defaultMessage: 'Board configuration',
    description: 'Title for the board name setup section',
  },
  [AppLabSetupItemId.NetworkSetup]: {
    id: 'appLabSetup.networkSetup.title',
    defaultMessage: 'Network Setup',
    description: 'Title for the network setup section',
  },
  [AppLabSetupItemId.LinuxCredentials]: {
    id: 'appLabSetup.linuxCredentials.title',
    defaultMessage: 'Linux Credentials',
    description: 'Title for the linux credentials setup section',
  },
  [AppLabSetupItemId.ArduinoAccount]: {
    id: 'appLabSetup.arduinoAccount.title',
    defaultMessage: 'Arduino Account',
    description: 'Title for the Arduino account setup section',
  },
});

export const sectionActionMessages = defineMessages<AppLabSetupItemId>({
  [AppLabSetupItemId.BoardConfiguration]: {
    id: 'appLabSetup.boardName.action',
    defaultMessage: 'Next',
    description: 'Action for the board configuration setup section',
  },
  [AppLabSetupItemId.NetworkSetup]: {
    id: 'appLabSetup.networkSetup.action',
    defaultMessage: 'Confirm',
    description: 'Action for the network setup section',
  },
  [AppLabSetupItemId.LinuxCredentials]: {
    id: 'appLabSetup.linuxCredentials.action',
    defaultMessage: 'Confirm',
    description: 'Action for the linux credentials setup section',
  },
  [AppLabSetupItemId.ArduinoAccount]: {
    id: 'appLabSetup.arduinoAccount.action',
    defaultMessage: 'Confirm',
    description: 'Action for the Arduino account setup section',
  },
});

export const tooltipMessages = defineMessages({
  wifiTooltipTitle: {
    id: 'appLabSetup.wifi.tooltip.title',
    defaultMessage: 'Why we ask for this',
    description:
      'Title for the wifi tooltip explaining network connection requirements',
  },
  wifiTooltipContent: {
    id: 'appLabSetup.wifi.tooltip.content',
    defaultMessage:
      'App Lab requires a network connection only during the initial configuration to ensure the most up-to-date experience.',
    description:
      'Content for the wifi tooltip explaining network connection requirements',
  },
  accountTooltipTitle: {
    id: 'appLabSetup.account.tooltip.title',
    defaultMessage: 'Why do we ask for this?',
    description:
      'Title for the account tooltip explaining Arduino account requirements',
  },
  accountTooltipContent: {
    id: 'appLabSetup.account.tooltip.content',
    defaultMessage:
      'App Lab works out of the box without an Arduino account, but signing in lets you unlock the full experience and enjoy every feature.',
    description:
      'Content for the account tooltip explaining Arduino account requirements',
  },
});
