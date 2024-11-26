const express = require('express');
var todoRouter = express.Router();
const db = require('../db-ops/dbHandler');
const authM = require('../middleware/auth-middle-ware');
const { route } = require('./auth');

todoRouter.post('/activate', (req, res) => {
    db.dbCud(res, 'update', 'users', new Map([['active', '1']]), `where id=${req.body.userId}, User ${req.body.userId} activated!`, 'Activating User failed!');
});

todoRouter.post('/deactivate', (req, res) => {
    db.dbCud(res, 'update', 'users', new Map([['active', '0']]), `where id=${req.body.userId}, User ${req.body.userId} deactivated! `, 'Deactivating User failed!');
});

function getFormattedTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

todoRouter.post('/addtodo', authM.chkLogin, (req, res) => {
    const { title, details } = req.body;
    const uid = req.session.uid;

    console.log("Request Body:", req.body);
    console.log("UID:", uid);

    if (!title || !details || !uid) {
        return res.status(400).json({
            message: "Adding Task failed!",
            error: "Title, details, and user ID must be provided."
        });
    }

    const createdDate = getFormattedTodayDate();
    const updatedTime = getCurrentTime();

    let todo = new Map([
        ['title', title],
        ['details', details],
        ['uid', uid],
        ['created_date', createdDate],
        ['updated_time', updatedTime]
    ]);

    db.dbCud(res, 'insert', 'tasks', todo, null, `Task ${title} added!`, `Adding Task failed!`);
});

todoRouter.post('/edittodo', authM.chkLogin, async (req, res) => {
    const { titleId, title, newTitle, newDetails } = req.body;
    const uid = req.session.uid;

    console.log("Request to edit task:");
    console.log("Title ID:", titleId);
    console.log("Current Title:", title);
    console.log("New Title:", newTitle);
    console.log("New Details:", newDetails);
    console.log("User ID:", uid);

    if (!titleId || !title || !uid || (!newTitle && !newDetails)) {
        return res.status(400).json({
            message: "Updating Task failed!",
            error: "Task titleId, title, user ID, and at least one of new title or new details must be provided."
        });
    }

    const checkCondition = `id = ? AND uid = ? AND title = ?`;
    const checkColValMap = new Map([
        ['title', title],
    ]);
    const checkValues = [titleId, uid, title];

    db.dbCud(res, 'select', 'tasks', checkColValMap, checkCondition, 'Task found', 'Task not found', (taskCheckResult) => {
        if (!taskCheckResult || taskCheckResult.length === 0) {
            return res.status(404).json({ message: `Task with title "${title}" and ID "${titleId}" not found for this user.` });
        }

        const updateColValMap = new Map();
        if (newTitle) {
            updateColValMap.set('title', newTitle);
        }
        if (newDetails) {
            updateColValMap.set('details', newDetails);
        }

        db.dbCud(res, 'update', 'tasks', updateColValMap, `id = ? AND uid = ?`,
            `Task "${title}" updated successfully!`,
            `Failed to update task.`, [titleId, uid]);
    });
});

todoRouter.post('/gettodo', authM.chkLogin, (req, res) => {
    const uid = req.session.uid;
    console.log("UID:", uid);

    const columns = ['title', 'details', 'created_date', 'updates_time', 'completed'];
    db.dbRead(res, 'tasks', `WHERE uid = ?`, [uid]);
});

todoRouter.post('/deltodo', authM.chkLogin, (req, res) => {
    const { title } = req.body;
    const uid = req.session.uid;

    console.log("Request to delete task with title:", title);
    console.log("User ID:", uid);

    if (!title || !uid) {
        return res.status(400).json({
            message: "Deleting Task failed!",
            error: "Task title and user ID must be provided."
        });
    }

    db.dbCud(res, 'delete', 'tasks', { title: title, uid: uid }, `WHERE title = ? AND uid = ?`,
        `Task "${title}" deleted!`,
        `Deleting Task failed!`);
});

module.exports = todoRouter;
