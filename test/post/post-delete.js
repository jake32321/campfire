const dotenv = require('dotenv');
dotenv.config();
const { createPost, deletePost } = require('../../services/post');
const db = require('../../lib/db');
const test = require('ava');

const internals = {
    ids: []
}

test.before(t => {
    const resOne = createPost({
        title: "This Is A Title",
        author: "Test Author",
        textBody: "I blessed the rains down in Africaaaaa!"
    });

    internals.ids.push(resOne.id);
});

test('Should delete a post if the ID matches a post.', async t => {
    const res = await deletePost(internals.ids[0]);

    t.is(res.message, `Post ${internals.ids[0]}, has been deleted.`);
});

test('Should fail when a post with an ID cannot be found.', async t => {
    try {
        const res = await deletePost('HgbY6qw');
    } catch (err) {
        t.is(err.output.payload.statusCode, 400);
        t.is(err.output.payload.error, 'Bad Request');
        t.is(err.output.payload.message, 'Could not find Post with ID: HgbY6qw');
    }
});

test('Should fail to retrieve with a bad Id.', async t => {
    try {
        const res = await deletePost('HyUn');
    } catch (err) {
        t.is(err.output.payload.statusCode, 400);
        t.is(err.output.payload.error, 'Bad Request');
        t.is(err.output.payload.message, 'Id is not valid.');
    }
});