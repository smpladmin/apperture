def filter_response(res):
    to_drop = ["revisionId", "createdAt", "updatedAt"]
    return {k: v for k, v in res.items() if k not in to_drop}
