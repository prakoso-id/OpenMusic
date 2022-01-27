const mapSongsToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    inserted_at,
    updated_at,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    insertedAt: inserted_at,
    updatedAt: updated_at,
});

const mapAlbumsToModel = ({
    id,
    name,
    year,
    cover,
    inserted_at,
    updated_at,
}) => ({
    id,
    name,
    year,
    coverUrl: cover,
    insertedAt: inserted_at,
    updatedAt: updated_at,
});

module.exports = {
    mapSongsToModel,
    mapAlbumsToModel
};