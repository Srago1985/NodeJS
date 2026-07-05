export const buildPostModel = ({
    id,
    title,
    content,
    author,
    dateCreated,
    tags,
    likes = 0,
    comments = [],
}) => ({
    id,
    title,
    content,
    author,
    dateCreated,
    tags,
    likes,
    comments,
});

export const buildCommentModel = ({
    user,
    message,
    dateCreated,
    likes = 0,
}) => ({
    user,
    message,
    dateCreated,
    likes,
});
