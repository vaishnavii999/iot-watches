# IoT Watches — Fleet Console

A small full-stack project built to turn a JSON data schema into something you
can actually click around in: a working API and a dashboard for a company
that manages health-monitoring watches.

---

## Why this was made

The starting point was just a JSON schema — a description of *data shape*:
an organisation has users, users wear watches, watches get software updates.
A schema on its own is just a plan. It doesn't do anything.

This project exists to answer the question: **"okay, now what?"**
- How do you actually store that data somewhere?
- How does a person (not a developer) see and change it without touching code?
- How do two separate programs — a server and a browser page — talk to each
  other reliably?

So this project is the schema, brought to life: a server that holds the data
and answers requests for it, and a page in the browser that shows it and lets
you interact with it (filter users, adjust a watch's settings, see update
status).

## How it can help (the business angle)

If this were a real company selling health-tracking watches, this kind of
system is the backbone of the actual product, not just the watch hardware:

- **Health alerting** — flagging users with abnormal heart rate is the
  feature that makes the product trustworthy, not just "a smartwatch."
- **Fleet management** — being able to see which watches are behind on
  software updates, or which models are used most, turns raw data into
  decisions (which model to discontinue, which client needs follow-up).
- **Operational efficiency** — a dashboard means someone in operations can
  answer a question themselves, instead of asking an engineer to look it up
  in a database every time.

In short: the schema stores the data, but the API + UI is what makes that
data *useful* to an actual business.

## What it helps you learn

This project touches the core ideas behind almost every real web app:

1. **Data modeling** — organizing related information (organisations → users
   → watches → updates) so it's easy to query and update.
2. **APIs** — a server doesn't just "have" data, it exposes specific,
   predictable ways to ask for it or change it (`GET` to read, `PATCH` to
   update). This is the same pattern used by virtually every app you use.
3. **Frontend/backend separation** — the browser page never touches the data
   directly. It only ever asks the server, and the server decides what's
   allowed. This separation is what lets you swap out the storage (e.g. move
   from in-memory data to a real database) without rewriting the UI.
4. **State and interactivity** — how a UI element like a slider turns a user
   action into a network request, and how the page updates itself once the
   server responds.
5. **Git/GitHub basics** — taking a project from your laptop to a shared,
   trackable repository.

## Project structure

```
iot-watches-app/
├── data.js        → the data itself (matches the schema: organisation, users, watches, updates)
├── server.js       → the API: defines what requests are allowed and what they do
├── public/
│   ├── index.html  → the page structure
│   ├── style.css   → the look (dark dashboard theme)
│   └── app.js       → the logic: fetches data from the API, draws it, sends updates back
├── package.json
└── package-lock.json
```

## How to run it

You need [Node.js](https://nodejs.org) installed first (any recent version).

1. Open a terminal and go into the project folder:
   ```
   cd iot-watches-app
   ```
2. Install the one dependency it needs (Express, the server library):
   ```
   npm install
   ```
3. Start the server:
   ```
   node server.js
   ```
4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

You should see the dashboard. Try dragging the age/heart-rate sliders on the
Users tab, or adjusting a watch's configuration slider and clicking Save —
you'll see the page talk to the server in real time.

To stop the server, go back to the terminal and press `Ctrl + C`.

## What each part does, in plain terms

- **`data.js`** — just a big object holding sample users, watches, and
  updates. Think of it as a tiny fake database.
- **`server.js`** — listens for requests like "give me all users" or "change
  this watch's configuration," looks in `data.js`, and replies. This is the
  **API**.
- **`public/app.js`** — runs in your browser. It asks the API for data, builds
  the table/cards you see, and sends new values back when you interact with a
  slider or button. This is the **UI**.

Those two pieces never share code directly — they only ever communicate
through normal web requests, the same way your browser talks to any website.
That's intentional: it's what makes this a real, extendable system instead of
a one-off script.
