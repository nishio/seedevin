// Initialize rules counter (will be set when popup opens)
let ruleIdCounter;

// Load blocked sites when popup opens and initialize counter
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get both dynamic and static rules to find highest ID
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const staticRules = await chrome.declarativeNetRequest.getSessionRules();
    const allRuleIds = [...dynamicRules, ...staticRules].map(r => r.id);
    ruleIdCounter = allRuleIds.length ? Math.max(...allRuleIds) + 1 : 100;
    
    // Display existing blocked sites
    dynamicRules.forEach(rule => {
      addSiteToList(rule.condition.urlFilter.replace('||', '').replace('^', ''));
    });
  } catch (error) {
    console.error('Failed to initialize rule counter:', error);
    // Default to 100 if we can't get existing rules
    ruleIdCounter = 100;
  }
});

// Add site button click handler
document.getElementById('addSite').addEventListener('click', async () => {
  const input = document.getElementById('siteInput');
  const domain = input.value.trim();
  
  if (!domain) return;

  // Create new blocking rule
  const newRule = {
    id: ruleIdCounter++,
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
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleToRemove = rules.find(rule => 
      rule.condition.urlFilter === `||${domain}^`
    );
    
    if (ruleToRemove) {
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [ruleToRemove.id]
        });
        siteItem.remove();
      } catch (error) {
        console.error('Failed to remove blocking rule:', error);
        alert('Failed to remove blocking rule. Please try again.');
      }
    }
  };
  
  siteItem.appendChild(domainText);
  siteItem.appendChild(removeButton);
  sitesList.appendChild(siteItem);
}
