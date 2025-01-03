// Migration of rules.json to chrome.storage and creation of dynamic rules
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Check if we already have blockedSites in storage
    const { blockedSites } = await chrome.storage.local.get('blockedSites');
    if (!blockedSites) {
      // Import initial rules from rules.json
      const response = await fetch(chrome.runtime.getURL('rules.json'));
      const rules = await response.json();
      
      // Extract domains from rules and create storage format
      const initialSites = rules.map(rule => ({
        domain: rule.condition.urlFilter.replace('||', '').replace('^', ''),
        enabled: true,
        addedAt: Date.now()
      }));

      // Store in chrome.storage.local
      await chrome.storage.local.set({
        blockedSites: initialSites,
        lastRuleId: rules.length
      });

      // Create dynamic rules for each site
      const dynamicRules = initialSites.map((site, index) => ({
        id: index + 1, // Use 1-based indexing for initial rules
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${site.domain}^`,
          resourceTypes: ['main_frame']
        }
      }));

      // Update dynamic rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: dynamicRules,
        removeRuleIds: []
      });

      console.log('Successfully migrated rules to storage and created blocking rules:', {
        sites: initialSites,
        rules: dynamicRules
      });
    }
  } catch (error) {
    console.error('Failed to migrate rules or create blocking rules:', error);
  }
});

// Ensure dynamic rules are reloaded on extension startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    // Get blocked sites from storage
    const { blockedSites } = await chrome.storage.local.get('blockedSites') || {};
    if (blockedSites && blockedSites.length > 0) {
      // First, remove any existing rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const removeRuleIds = existingRules.map(rule => rule.id);
      
      // Create new rules from stored sites
      const dynamicRules = blockedSites.map((site, index) => ({
        id: 100 + index, // Use 100+ for runtime-created rules
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${site.domain}^`,
          resourceTypes: ['main_frame']
        }
      }));

      // Update rules: remove old ones and add new ones
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: dynamicRules
      });

      console.log('Successfully restored blocking rules on startup:', {
        sites: blockedSites,
        rules: dynamicRules
      });
    }
  } catch (error) {
    console.error('Failed to restore blocking rules on startup:', error);
  }
});
