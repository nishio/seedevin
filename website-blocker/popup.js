// Load blocked sites from storage and manage rules
async function loadStorageSites() {
  const { blockedSites } = await chrome.storage.local.get('blockedSites');
  return blockedSites || [];
}

// Get and increment rule ID from storage
async function getNextRuleId() {
  const { lastRuleId } = await chrome.storage.local.get('lastRuleId');
  const nextId = (lastRuleId || 100) + 1;
  await chrome.storage.local.set({ lastRuleId: nextId });
  return nextId;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const sites = await loadStorageSites();
    sites.forEach(site => {
      if (site.enabled) {
        addSiteToList(site.domain);
      }
    });
  } catch (error) {
    console.error('Failed to load blocked sites:', error);
  }
});

// Add site button click handler
document.getElementById('addSite').addEventListener('click', async () => {
  const input = document.getElementById('siteInput');
  const domain = input.value.trim();
  
  if (!domain) return;

  // Create new blocking rule
  const newRule = {
    id: await getNextRuleId(),
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `||${domain}^`,
      resourceTypes: ['main_frame']
    }
  };

  // Add the rule
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [newRule],
      removeRuleIds: []
    });
    
    // Update UI only if rule was added successfully
    addSiteToList(domain);
    input.value = '';
  } catch (error) {
    console.error('Failed to add blocking rule:', error);
    alert('Failed to add blocking rule. Please try again.');
  }
});

// Function to add site to the UI list
function addSiteToList(domain) {
  const sitesList = document.getElementById('sitesList');
  const siteItem = document.createElement('div');
  siteItem.className = 'site-item';
  
  const domainText = document.createElement('span');
  domainText.textContent = domain;
  
  const removeButton = document.createElement('button');
  removeButton.className = 'remove-btn';
  removeButton.textContent = 'Remove';
  removeButton.onclick = async () => {
    try {
      // Get current sites and rules
      const [sites, rules] = await Promise.all([
        loadStorageSites(),
        chrome.declarativeNetRequest.getDynamicRules()
      ]);

      // Find rule to remove
      const ruleToRemove = rules.find(rule => 
        rule.condition.urlFilter === `||${domain}^`
      );

      if (ruleToRemove) {
        // Update storage and rules
        await Promise.all([
          chrome.storage.local.set({
            blockedSites: sites.filter(site => site.domain !== domain)
          }),
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [ruleToRemove.id]
          })
        ]);
        siteItem.remove();
      }
    } catch (error) {
      console.error('Failed to remove blocking rule:', error);
      alert('Failed to remove blocking rule. Please try again.');
    }
  };
  
  siteItem.appendChild(domainText);
  siteItem.appendChild(removeButton);
  sitesList.appendChild(siteItem);
}
