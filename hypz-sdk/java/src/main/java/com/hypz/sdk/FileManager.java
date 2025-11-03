package com.hypz.sdk;

import okhttp3.*;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

/**
 * File operations manager
 */
public class FileManager {
    
    private final HypzClient client;
    
    FileManager(HypzClient client) {
        this.client = client;
    }
    
    /**
     * Upload a file to a bucket
     * 
     * @param bucketId Bucket ID
     * @param file File to upload
     * @param metadata Optional metadata
     * @param tags Optional tags
     * @return Upload response
     */
    public HypzClient.HypzResponse upload(String bucketId, File file, Map<String, String> metadata, String[] tags) throws IOException {
        MultipartBody.Builder builder = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", file.getName(),
                RequestBody.create(file, MediaType.parse("application/octet-stream")));
        
        if (metadata != null) {
            builder.addFormDataPart("metadata", client.getGson().toJson(metadata));
        }
        
        if (tags != null && tags.length > 0) {
            builder.addFormDataPart("tags", String.join(",", tags));
        }
        
        RequestBody requestBody = builder.build();
        
        Request request = new Request.Builder()
            .url(client.getBaseUrl() + "/files/" + bucketId + "/upload")
            .post(requestBody)
            .build();
        
        try (Response response = client.getHttpClient().newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "{}";
            com.google.gson.JsonObject json = client.getGson().fromJson(responseBody, com.google.gson.JsonObject.class);
            
            return new HypzClient.HypzResponse(
                response.code(),
                json.get("success").getAsBoolean(),
                json.has("message") ? json.get("message").getAsString() : null,
                json.has("data") ? json.get("data") : null
            );
        }
    }
    
    /**
     * Upload a file with no metadata or tags
     */
    public HypzClient.HypzResponse upload(String bucketId, File file) throws IOException {
        return upload(bucketId, file, null, null);
    }
    
    /**
     * Upload bytes as a file
     * 
     * @param bucketId Bucket ID
     * @param fileName File name
     * @param bytes File content as bytes
     * @return Upload response
     */
    public HypzClient.HypzResponse uploadBytes(String bucketId, String fileName, byte[] bytes) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", fileName,
                RequestBody.create(bytes, MediaType.parse("application/octet-stream")))
            .build();
        
        Request request = new Request.Builder()
            .url(client.getBaseUrl() + "/files/" + bucketId + "/upload")
            .post(requestBody)
            .build();
        
        try (Response response = client.getHttpClient().newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "{}";
            com.google.gson.JsonObject json = client.getGson().fromJson(responseBody, com.google.gson.JsonObject.class);
            
            return new HypzClient.HypzResponse(
                response.code(),
                json.get("success").getAsBoolean(),
                json.has("message") ? json.get("message").getAsString() : null,
                json.has("data") ? json.get("data") : null
            );
        }
    }
    
    /**
     * List files in a bucket
     * 
     * @param bucketId Bucket ID
     * @param page Page number
     * @param limit Items per page
     * @return List of files
     */
    public HypzClient.HypzResponse list(String bucketId, int page, int limit) throws IOException {
        return client.get("/files/" + bucketId + "/files?page=" + page + "&limit=" + limit);
    }
    
    /**
     * List files with default pagination
     */
    public HypzClient.HypzResponse list(String bucketId) throws IOException {
        return list(bucketId, 1, 20);
    }
    
    /**
     * Get file details
     * 
     * @param fileId File ID
     * @return File details
     */
    public HypzClient.HypzResponse get(String fileId) throws IOException {
        return client.get("/files/file/" + fileId);
    }
    
    /**
     * Download file
     * 
     * @param fileId File ID
     * @param outputFile File to save to
     * @throws IOException if download fails
     */
    public void download(String fileId, File outputFile) throws IOException {
        Request request = new Request.Builder()
            .url(client.getBaseUrl() + "/files/file/" + fileId + "/download")
            .get()
            .build();
        
        try (Response response = client.getHttpClient().newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Download failed: " + response.code());
            }
            
            try (InputStream is = response.body().byteStream();
                 FileOutputStream fos = new FileOutputStream(outputFile)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
        }
    }
    
    /**
     * Download file as bytes
     * 
     * @param fileId File ID
     * @return File content as bytes
     */
    public byte[] downloadBytes(String fileId) throws IOException {
        Request request = new Request.Builder()
            .url(client.getBaseUrl() + "/files/file/" + fileId + "/download")
            .get()
            .build();
        
        try (Response response = client.getHttpClient().newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Download failed: " + response.code());
            }
            return response.body().bytes();
        }
    }
    
    /**
     * Update file metadata
     * 
     * @param fileId File ID
     * @param updates Map of fields to update
     * @return Update response
     */
    public HypzClient.HypzResponse update(String fileId, Map<String, Object> updates) throws IOException {
        return client.put("/files/file/" + fileId, updates);
    }
    
    /**
     * Delete file
     * 
     * @param fileId File ID
     * @return Deletion response
     */
    public HypzClient.HypzResponse delete(String fileId) throws IOException {
        return client.delete("/files/file/" + fileId);
    }
    
    /**
     * Get public download URL for a file
     * 
     * @param fileId File ID
     * @return Public download URL
     */
    public String getPublicUrl(String fileId) {
        return client.getBaseUrl() + "/files/public/" + fileId + "/download";
    }
}
