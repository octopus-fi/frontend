export async function uploadJsonToWalrus({
    json,
}: {
    json: object;
}): Promise<string> {
    const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";

    try {
        // 1. Serialize JSON
        const jsonString = JSON.stringify(json, null, 2);

        // 2. Upload via HTTP PUT
        // Walrus Publisher accepts the body directly.
        const response = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=5`, {
            method: "PUT",
            body: jsonString,
            headers: {
                "Content-Type": "application/json" // Hint, though Walrus treats as binary
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Walrus Upload Failed: ${response.status} ${errorText}`);
        }

        /*
          Response format (example):
          {
             "newlyCreated": {
                "blobObject": {
                   "blobId": "..."
                }
             }
          }
          OR 
          {
             "alreadyCertified": {
                "blobId": "..."
             }
          }
        */
        const data = await response.json();
        console.log("Walrus response:", JSON.stringify(data, null, 2));

        let blobId: string | undefined;

        if (data.newlyCreated) {
            // API uses snake_case: blob_object.blobId or blob_object.blob_id
            const blobObj = data.newlyCreated.blob_object || data.newlyCreated.blobObject;
            blobId = blobObj?.blobId || blobObj?.blob_id;
        } else if (data.alreadyCertified) {
            blobId = data.alreadyCertified.blobId || data.alreadyCertified.blob_id;
        }

        if (!blobId) {
            console.error("Unknown Walrus response format:", data);
            throw new Error("Could not parse Blob ID from Walrus response");
        }

        return blobId;

    } catch (error: any) {
        console.error("Walrus Upload Error:", error);
        throw new Error(error.message || "Failed to upload to Walrus");
    }
}
