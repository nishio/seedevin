// Initialize rules counter
let ruleIdCounter = 1;

// Load blocked sites when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  rules.forEach(rule => {
    addSiteToList(rule.condition.urlFilter.replace('||', '').replace('^', ''));
  });
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
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [newRule],
    removeRuleIds: []
  });

  // Update UI
  addSiteToList(domain);
  input.value = '';
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
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleToRemove.id]
      });
      siteItem.remove();
    }
  };
  
  siteItem.appendChild(domainText);
  siteItem.appendChild(removeButton);
  sitesList.appendChild(siteItem);
}
