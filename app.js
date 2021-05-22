const express = require("express");
const axios = require("axios");
const browse = require("open");
const fs = require("fs");
const app = express();

// Middleware
app.use(express.json());

// Route
app.get("/", (req, res) => {
    fs.readFile("token.json", "utf8", (err, data) => {
        if (err) throw err;
        data = JSON.parse(data);

        browse(
            `https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&response_type=code&client_id=${data.client_id}&scope=${data.scope}&access_type=offline&redirect_uri=http://127.0.0.1:5000/redirect`
        );

        res.end();
    });
});

// @route GET /redirect
app.get("/redirect", (req, res) => {
    fs.readFile("token.json", "utf8", (err, token) => {
        if (err) throw err;

        token = JSON.parse(token);

        if (!token.refresh_token) {
            token.code = req.query.code;

            fs.writeFile("token.json", JSON.stringify(token, null, "\t"), (err) => {
                if (err) throw err;
                let html = `<form action='/redirect' method='POST'>
                                <button type='submit'>Get Tokens</button>
                            </form>`;
                res.send(html);
            });
        } else {
            res.send("User is authorized to send emails.");
        }
    });
});

// @route POST /redirect
app.post("/redirect", (req, res) => {
    fs.readFile("token.json", "utf8", (err, token) => {
        if (err) throw err;

        token = JSON.parse(token);

        axios
            .post(
                "https://oauth2.googleapis.com/token",
                `code=${token.code}&redirect_uri=http%3A%2F%2F127.0.0.1%3A5000%2Fredirect&client_id=${token.client_id}&client_secret=${token.client_secret}&grant_type=authorization_code`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            )
            .then((body) => {
                token.access_token = body.data.access_token;
                token.refresh_token = body.data.refresh_token;

                fs.writeFile("token.json", JSON.stringify(token, null, "\t"), (err) => {
                    if (err) throw err;

                    res.send("User is authorized to send emails.");
                });
            })
            .catch((err) => console.log("Access:", err));
    });
});

// @route POST /sendmail
app.post("/sendmail", (req, res) => {
    const { to, sub, msg } = req.body;

    fs.readFile("token.json", "utf8", (err, token) => {
        if (err) throw err;

        token = JSON.parse(token);
        var str = `To: ${to}\nFrom: ${token.email}\nSubject: ${sub}\n\n${msg}`;

        axios
            .post(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send?access_token=${token.access_token}`, {
                raw: Buffer.from(str, "utf-8").toString("base64"),
            })
            .then(() => {
                res.end("Mail Sent!");
            })
            .catch((err) => console.log("Mail:", err));
    });
});

app.listen(5000, () => console.log("Live at 5000..."));
