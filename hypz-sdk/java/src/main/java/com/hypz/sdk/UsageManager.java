package com.hypz.sdk;

import java.io.IOException;

/**
 * Usage statistics manager
 */
public class UsageManager {
    
    private final HypzClient client;
    
    UsageManager(HypzClient client) {
        this.client = client;
    }
    
    /**
     * Get current usage statistics
     * 
     * @return Usage stats including storage, bandwidth, API calls
     */
    public HypzClient.HypzResponse getCurrent() throws IOException {
        return client.get("/usage/current");
    }
    
    /**
     * Get usage history
     * 
     * @param days Number of days to retrieve
     * @return Usage history
     */
    public HypzClient.HypzResponse getHistory(int days) throws IOException {
        return client.get("/usage/history?days=" + days);
    }
    
    /**
     * Get usage history for last 30 days
     */
    public HypzClient.HypzResponse getHistory() throws IOException {
        return getHistory(30);
    }
}
