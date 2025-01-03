// Migration of rules.json to chrome.storage
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

      console.log('Successfully migrated rules to storage:', initialSites);
    }
  } catch (error) {
    console.error('Failed to migrate rules to storage:', error);
  }
});
