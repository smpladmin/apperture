def filter_response(res):
    to_drop = [
        "revisionId",
        "createdAt",
        "updatedAt",
        "created_at",
        "revision_id",
        "updated_at",
    ]
    return {k: v for k, v in res.items() if k not in to_drop}
