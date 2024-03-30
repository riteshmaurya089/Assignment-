
const express = require("express");
const cors = require("cors");
const passport = require("./auth"); // Import Passport configuration
const session = require("express-session");
const path = require("path");
const { google } = require('googleapis');
const { OpenAI } = require('openai'); // Import OpenAI object
require("dotenv").config();
const nodemailer = require("nodemailer");


const app = express();
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());
app.use(cors());

function isLoggedin(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize OpenAI object
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Function to generate automated replies using OpenAI
// const generateAutomatedReply = async (emailSnippet) => {
//     try {
//         console.log("GENERATED AUTOMATED REPLY", emailSnippet);
//         // Analyze the email snippet using OpenAI
//         const analyzedContent = await analyzeEmail(emailSnippet);

//         // Check if the analyzed content indicates interest, job in Delhi, or job in backend
//         if (analyzedContent.includes('interested') && analyzedContent.toLowerCase().includes('delhi') && analyzedContent.toLowerCase().includes('node js developer')) {
//             return 'Automated reply: Thank you for your interest! Would you like to schedule a demo call?';
//         } else if (analyzedContent.toLowerCase().includes('backend')) {
//             return 'Automated reply: Sure, I can provide more information about the backend development position. When would be a good time for you to discuss further?';
//         } else {
//             return 'Automated reply: Sorry, I am not interested in your query!! Thank you.';
//         }
//     } catch (error) {
//         console.error('Error generating automated reply:', error);
//         throw error;
//     }
// };

const generateAutomatedReply = async (emailSnippet) => {
    try {
        console.log("GENERATED AUTOMATED REPLY", emailSnippet);
        // Analyze the email snippet using OpenAI
        const analyzedContent = await analyzeEmail(emailSnippet);

        // Check if the analyzed content indicates interest, job in Delhi, or job in backend
        let replyMessage = "";
        if (analyzedContent.includes('interested') || analyzedContent.toLowerCase().includes('delhi') || analyzedContent.toLowerCase().includes('node js developer')) {
            replyMessage = 'Thank you for your interest! Would you like to schedule a demo call?';
        } else if (analyzedContent.toLowerCase().includes('backend')) {
            replyMessage = 'Sure, I can provide more information about the backend development position. When would be a good time for you to discuss further?';
        } else {
            replyMessage = 'Sorry, I am not interested in your query!! Thank you.';
        }

        // Send automated reply via email
        await sendEmail("riteshmaurya222201@gmail.com", "Automated Reply", replyMessage);
    } catch (error) {
        console.error('Error generating and sending automated reply:', error);
        throw error;
    }
};

// Function to send email using NodeMailer
const sendEmail = async (recipient, subject, message) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.email,
                pass: process.env.password,
            }
        });

        const mailOptions = {
            from: "ayanmaurya89@gmail.com",
            to: process.env.email,
            subject:subject,
            text: message
        };

        let info = await transporter.sendMail(mailOptions);
        
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Function to analyze email content using OpenAI
const analyzeEmail = async (emailContent) => {
    try {
        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: emailContent }],
            model: "gpt-3.5-turbo",
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error('Error analyzing email:', error);
        if (error.code === 'insufficient_quota') {
            // Handle rate limit error
            return 'Error: Rate limit exceeded. Please try again later.';
        } else {
            throw error;
        }
    }
};

// Inside the "/auth/protected" route handler
app.get("/auth/protected", isLoggedin, async (req, res) => {
    try {
        // console.log("Ritesh INSIDE PROTECTED ROUTE");
        // Get access token from the user's session
        const accessToken = req.user.tokens.access_token;

        // Set access token for OAuth client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        // Example: Fetch user's Gmail profile
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });

        // Fetch the list of messages
        const messages = await gmail.users.messages.list({ userId: 'me' });

        // Check if there are any messages
        if (!messages.data.messages || messages.data.messages.length === 0) {
            console.log('No messages found in the inbox');
            res.status(404).send('No messages found in the inbox');
            return;
        }

        // Fetch the content of the first message
        const messageId = messages.data.messages[0].id;
        const messageData = await gmail.users.messages.get({ userId: 'me', id: messageId });

        // Check if payload and snippet are defined
        if (!messageData.data.payload || !messageData.data.snippet) {
            console.error('Payload or snippet is undefined');
            res.status(500).send('Error: Email content is undefined');
            return;
        }

        // Extract the email snippet
        const emailSnippet = messageData.data.snippet;

        // Logging the snippet to check its content
        console.log('Email snippet:', emailSnippet);

        // Generate automated reply based on the context of the email
        const reply = await generateAutomatedReply(emailSnippet);

        // Send the automated reply as the response
        res.send(reply);
    } catch (error) {
        console.error('Error fetching and generating automated replies:', error);
        res.status(500).send('Error fetching and generating automated replies');
    }
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile','https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.compose'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
    })
);

app.get("/auth/google/failure", (req, res) => {
    res.send("Something went wrong");
});

app.use("/auth/logout", (req, res) => {
    req.session.destroy();
    res.send("Logged out");
});

app.get("*", (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'frontend') });
});

app.listen(5500, () => {
    console.log("Server started");
});


