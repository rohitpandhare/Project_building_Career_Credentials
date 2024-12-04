const express = require('express');
const todoRouter = express.Router();
const db = require('../db-ops/dbHandler');
const authM = require('../middleware/auth-middle-ware');

todoRouter.get('/gettodo', authM.chkLogin, (req, res) => {
    const uid = req.session.uid;
    db.dbRead(res, 'tasks', `WHERE uid = '${uid}'`);  
});

todoRouter.get('/gettodo/:id', authM.chkLogin, (req, res) => {
    const uid = req.session.uid;
    const taskId = req.params.id;
    db.dbRead(res, 'tasks', `WHERE id = '${taskId}' AND uid = '${uid}'`);
});

todoRouter.post('/addtodo', authM.chkLogin, (req, res) => {
    const { title, details } = req.body;
    const uid = req.session.uid;

    if (!title || !details || !uid) {
        return res.status(400).json({
            message: "Adding Task failed!",
            error: "Title, details, and user ID must be provided."
        });
    }

    const createDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const colValMap = new Map();
    colValMap.set('title', title);
    colValMap.set('details', details);
    colValMap.set('uid', uid);
    colValMap.set('created_date', createDate);
    colValMap.set('updated_time', createDate);

    db.dbCud(res, 'insert', 'tasks', colValMap, null, `Task ${title} added!`, `Adding Task failed!`);
});

todoRouter.post('/edittodo', authM.chkLogin, (req, res) => {
    console.log("Received POST on /edittodo:", req.body);

    const { id, title, details } = req.body;
    const uid = req.session.uid;

    if (!id || (!title && !details) || !uid) {
        return res.status(400).json({
            message: "Updating Task failed!",
            error: "ID, title, details, and user ID must be provided."
        });
    }

    const updateColValMap = new Map();
    if (title) {
        updateColValMap.set('title', title);
    }
    if (details) {
        updateColValMap.set('details', details);
    }

    const query = `UPDATE tasks SET ${Array.from(updateColValMap.keys())
        .map((key) => `${key} = ?`)
        .join(', ')} WHERE id = ? AND uid = ?`;

    const values = [...Array.from(updateColValMap.values()), id, uid];

    db.conPool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error during update:', err);
            return res.status(500).json({ message: "Failed to update task.", error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found or not owned by user." });
        }

        res.status(200).json({ message: "Task updated successfully!" });
    });
});

todoRouter.post('/deltodo', authM.chkLogin, (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;

    if (!id || !uid) {
        return res.status(400).json({ message: "Deleting Task failed!", error: "ID and user ID must be provided." });
    }

    const query = 'DELETE FROM tasks WHERE id = ? AND uid = ?';

    db.conPool.query(query, [id, uid], (err, result) => {
        if (err) {
            console.error('Error during deletion:', err);
            return res.status(500).json({ message: "Failed to delete task.", error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json({ message: "Task deleted successfully!" });
    });
});

module.exports = todoRouter;
