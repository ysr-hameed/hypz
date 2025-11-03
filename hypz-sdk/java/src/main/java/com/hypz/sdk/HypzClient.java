package com.hypz.sdk;

import okhttp3.*;
import com.google.gson.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Main Hypz SDK Client for Java/Android
 * 
 * Usage:
 * <pre>
 * HypzClient client = new HypzClient.Builder()
 *     .apiKey("your_api_key")
 *     .baseUrl("https://api.hypz.io/api/v1")
 *     .build();
 * </pre>
 */
public class HypzClient {
    
    private final String apiKey;
    private final String baseUrl;
    private final OkHttpClient httpClient;
    private final Gson gson;
    
    // Managers
    private BucketManager bucketManager;
    private FileManager fileManager;
    private ApiKeyManager apiKeyManager;
    private UsageManager usageManager;
    
    private HypzClient(Builder builder) {
        this.apiKey = builder.apiKey;
        this.baseUrl = builder.baseUrl.endsWith("/") 
            ? builder.baseUrl.substring(0, builder.baseUrl.length() - 1)
            : builder.baseUrl;
        
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(builder.connectTimeout, TimeUnit.SECONDS)
            .readTimeout(builder.readTimeout, TimeUnit.SECONDS)
            .writeTimeout(builder.writeTimeout, TimeUnit.SECONDS)
            .addInterceptor(chain -> {
                Request original = chain.request();
                Request.Builder requestBuilder = original.newBuilder()
                    .header("X-API-Key", apiKey)
                    .header("User-Agent", "Hypz-Java-SDK/1.0.0")
                    .method(original.method(), original.body());
                
                Request request = requestBuilder.build();
                return chain.proceed(request);
            })
            .build();
        
        this.gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .create();
        
        // Initialize managers
        this.bucketManager = new BucketManager(this);
        this.fileManager = new FileManager(this);
        this.apiKeyManager = new ApiKeyManager(this);
        this.usageManager = new UsageManager(this);
    }
    
    /**
     * Get bucket operations manager
     */
    public BucketManager buckets() {
        return bucketManager;
    }
    
    /**
     * Get file operations manager
     */
    public FileManager files() {
        return fileManager;
    }
    
    /**
     * Get API key operations manager
     */
    public ApiKeyManager apiKeys() {
        return apiKeyManager;
    }
    
    /**
     * Get usage statistics manager
     */
    public UsageManager usage() {
        return usageManager;
    }
    
    // Package-private getters for managers
    OkHttpClient getHttpClient() {
        return httpClient;
    }
    
    String getBaseUrl() {
        return baseUrl;
    }
    
    Gson getGson() {
        return gson;
    }
    
    /**
     * Make a GET request
     */
    HypzResponse get(String endpoint) throws IOException {
        Request request = new Request.Builder()
            .url(baseUrl + endpoint)
            .get()
            .build();
        
        return executeRequest(request);
    }
    
    /**
     * Make a POST request
     */
    HypzResponse post(String endpoint, Object data) throws IOException {
        String json = gson.toJson(data);
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        
        Request request = new Request.Builder()
            .url(baseUrl + endpoint)
            .post(body)
            .build();
        
        return executeRequest(request);
    }
    
    /**
     * Make a PUT request
     */
    HypzResponse put(String endpoint, Object data) throws IOException {
        String json = gson.toJson(data);
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        
        Request request = new Request.Builder()
            .url(baseUrl + endpoint)
            .put(body)
            .build();
        
        return executeRequest(request);
    }
    
    /**
     * Make a DELETE request
     */
    HypzResponse delete(String endpoint) throws IOException {
        Request request = new Request.Builder()
            .url(baseUrl + endpoint)
            .delete()
            .build();
        
        return executeRequest(request);
    }
    
    /**
     * Execute HTTP request and parse response
     */
    private HypzResponse executeRequest(Request request) throws IOException {
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "{}";
            
            JsonObject json = gson.fromJson(responseBody, JsonObject.class);
            
            return new HypzResponse(
                response.code(),
                json.get("success").getAsBoolean(),
                json.has("message") ? json.get("message").getAsString() : null,
                json.has("data") ? json.get("data") : null
            );
        }
    }
    
    /**
     * Builder for HypzClient
     */
    public static class Builder {
        private String apiKey;
        private String baseUrl = "http://localhost:5000/api/v1";
        private long connectTimeout = 30;
        private long readTimeout = 30;
        private long writeTimeout = 30;
        
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }
        
        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }
        
        public Builder connectTimeout(long seconds) {
            this.connectTimeout = seconds;
            return this;
        }
        
        public Builder readTimeout(long seconds) {
            this.readTimeout = seconds;
            return this;
        }
        
        public Builder writeTimeout(long seconds) {
            this.writeTimeout = seconds;
            return this;
        }
        
        public HypzClient build() {
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalArgumentException("API key is required");
            }
            return new HypzClient(this);
        }
    }
    
    /**
     * Response wrapper
     */
    public static class HypzResponse {
        private final int statusCode;
        private final boolean success;
        private final String message;
        private final JsonElement data;
        
        HypzResponse(int statusCode, boolean success, String message, JsonElement data) {
            this.statusCode = statusCode;
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        public int getStatusCode() {
            return statusCode;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public JsonElement getData() {
            return data;
        }
        
        public <T> T getDataAs(Class<T> clazz) {
            if (data == null) return null;
            return new Gson().fromJson(data, clazz);
        }
    }
}
