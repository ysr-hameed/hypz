import { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserPlan, getPlanById, getUsagePercentage, canAccessFeature } from '../config/plans';
import { logger } from '../utils/logger';

const PlanContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserPlan();
  }, []);

  const loadUserPlan = async () => {
    try {
      setLoading(true);
      const data = await fetchUserPlan();
      setUserData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      logger.error('Failed to load user plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = (newPlanId) => {
    const newPlan = getPlanById(newPlanId);
    if (newPlan) {
      setUserData(prev => ({
        ...prev,
        currentPlan: {
          ...prev.currentPlan,
          planId: newPlanId
        },
        planDetails: newPlan
      }));
    }
  };

  const updateRenewalSettings = (renewalType, autoUpgrade) => {
    setUserData(prev => ({
      ...prev,
      currentPlan: {
        ...prev.currentPlan,
        renewalType,
        autoUpgrade
      }
    }));
  };

  const updateUsage = (type, value) => {
    setUserData(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        [type]: {
          ...prev.usage[type],
          ...value
        }
      }
    }));
  };

  const addBucket = (bucket) => {
    setUserData(prev => ({
      ...prev,
      buckets: [...(prev.buckets || []), bucket]
    }));
  };

  const updateBucket = (bucketId, updates) => {
    setUserData(prev => ({
      ...prev,
      buckets: prev.buckets.map(b => 
        b.id === bucketId ? { ...b, ...updates } : b
      )
    }));
  };

  const deleteBucket = (bucketId) => {
    setUserData(prev => ({
      ...prev,
      buckets: prev.buckets.filter(b => b.id !== bucketId)
    }));
  };

  const addApiKey = (apiKey) => {
    setUserData(prev => ({
      ...prev,
      apiKeys: [...(prev.apiKeys || []), apiKey]
    }));
  };

  const deleteApiKey = (keyId) => {
    setUserData(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(k => k.id !== keyId)
    }));
  };

  const addTeamMember = (member) => {
    const currentMembers = userData?.teamMembers?.length || 0;
    const maxMembers = userData?.planDetails?.teamMembers || 1;
    
    if (currentMembers >= maxMembers) {
      throw new Error(`Your plan allows only ${maxMembers} team member(s). Upgrade to add more.`);
    }

    setUserData(prev => ({
      ...prev,
      teamMembers: [...(prev.teamMembers || []), member]
    }));
  };

  const removeTeamMember = (memberId) => {
    setUserData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== memberId)
    }));
  };

  const getStorageUsage = () => {
    if (!userData) return { used: 0, limit: 0, percentage: 0 };
    const { used, limit } = userData.usage.storage;
    return {
      used,
      limit,
      percentage: getUsagePercentage(used, limit)
    };
  };

  const getBandwidthUsage = () => {
    if (!userData) return { used: 0, limit: 0, percentage: 0 };
    const { used, limit } = userData.usage.bandwidth;
    return {
      used,
      limit,
      percentage: getUsagePercentage(used, limit)
    };
  };

  const getApiCallsUsage = () => {
    if (!userData) return { used: 0, limit: 0, percentage: 0 };
    const { used, limit } = userData.usage.apiCalls;
    return {
      used,
      limit,
      percentage: getUsagePercentage(used, limit)
    };
  };

  const hasFeature = (feature) => {
    if (!userData?.planDetails) return false;
    return canAccessFeature(userData.planDetails, feature);
  };

  const canAddTeamMember = () => {
    const currentMembers = userData?.teamMembers?.length || 0;
    const maxMembers = userData?.planDetails?.teamMembers || 1;
    return currentMembers < maxMembers;
  };

  const value = {
    userData,
    planDetails: userData?.planDetails,
    loading,
    error,
    loadUserPlan,
    updatePlan,
    updateRenewalSettings,
    updateUsage,
    addBucket,
    updateBucket,
    deleteBucket,
    addApiKey,
    deleteApiKey,
    addTeamMember,
    removeTeamMember,
    getStorageUsage,
    getBandwidthUsage,
    getApiCallsUsage,
    hasFeature,
    canAddTeamMember
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};
