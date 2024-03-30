# ReachInbox

ReachInbox is a project that integrates Google OAuth authentication via Passport.js and utilizes the OpenAI API to analyze emails. This project automates responses to incoming emails based on their content.

## Features

- **Google OAuth Integration**: Allows users to sign in using their Google accounts.
- **Mail Scope**: Requests necessary permissions to read and write emails.
- **OpenAI Integration**: Analyzes the content of emails using the OpenAI API.
- **Automated Responses**:
  - Assigns labels to emails related to job opportunities in Node.js backend development.
  - Generates appropriate responses based on the content of the email.

## Setting Up Google OAuth

Please note that the organization is not verified for Google OAuth. To enable authentication, follow these steps:

1. Navigate to the Google Developer Console.
2. Add the email ID associated with your organization to the developer console.
3. Configure OAuth consent screen settings.
4. Set up OAuth client ID and secret.
5. Ensure necessary scopes are added, including reading and writing emails.

## Automated Responses

- **Job Opportunity in Node.js Backend Development**:
  - Assigns a label to the email.
  - Sends the message: "Thank you for your interest! Would you like to schedule a demo call?"

- **General Backend Inquiry**:
  - Sends the message: "Sure, I can provide more information about the backend development position. When would be a good time for you to discuss further?"

- **Other Inquiries**:
  - Sends the message: "Sorry, I am not interested in your query!! Thank you."




