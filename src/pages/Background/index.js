const get = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, (data) => {
      resolve(data);
    });
  });
};

const set = (key, value) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, (data) => {
      resolve(data);
    });
  });
};

const AWS_ACCOUNTS = [
  // { name: 'US East (N. Virginia)', id: 'us-east-1' },
  // { name: 'US East (Ohio)', id: 'us-east-2' },
  // { name: 'US West (N. California)', id: 'us-west-1' },
  // { name: 'US West (Oregon)', id: 'us-west-2' },
  // { name: 'Europe (Frankfurt)', id: 'eu-central-1' },
  // { name: 'Europe (Ireland)', id: 'eu-west-1' },
  // { name: 'Europe (London)', id: 'eu-west-2' },
  // { name: 'Europe (Paris)', id: 'eu-west-3' },
  // { name: 'Europe (Milan)', id: 'eu-south-1' },
  // { name: 'Europe (Stockholm)', id: 'eu-north-1' },
  // { name: 'Asia Pacific (Hong Kong)', id: 'ap-east-1' },
  // { name: 'Asia Pacific (Mumbai)', id: 'ap-south-1' },
  // { name: 'Asia Pacific (Tokyo)', id: 'ap-northeast-1' },
  // { name: 'Asia Pacific (Seoul)', id: 'ap-northeast-2' },
  // { name: 'Asia Pacific (Osaka)', id: 'ap-northeast-3' },
  // { name: 'Asia Pacific (Singapore)', id: 'ap-southeast-1' },
  // { name: 'Asia Pacific (Sydney)', id: 'ap-southeast-2' },
  // { name: 'Canada (Central)', id: 'ca-central-1' },
  // { name: 'China (Beijing)', id: 'cn-north-1' },
  // { name: 'China (Ningxia)', id: 'cn-northwest-1' },
  // { name: 'Africa (Cape Town)', id: 'af-south-1' },
  // { name: 'Middle East (Bahrain)', id: 'me-south-1' },
  // { name: 'South America (São Paulo)', id: 'sa-east-1' },
  // { name: 'AWS GovCloud (US-East)', id: 'us-gov-east-1' },
  // { name: 'AWS GovCloud (US-West)', id: 'us-gov-west-1' },
];

const AWS_REGIONS_NAME = [
  { name: 'US East (N. Virginia)', id: 'us-east-1' },
  { name: 'US East (Ohio)', id: 'us-east-2' },
  { name: 'US West (N. California)', id: 'us-west-1' },
  { name: 'US West (Oregon)', id: 'us-west-2' },
  { name: 'Europe (Frankfurt)', id: 'eu-central-1' },
  { name: 'Europe (Ireland)', id: 'eu-west-1' },
  { name: 'Europe (London)', id: 'eu-west-2' },
  { name: 'Europe (Paris)', id: 'eu-west-3' },
  { name: 'Europe (Milan)', id: 'eu-south-1' },
  { name: 'Europe (Stockholm)', id: 'eu-north-1' },
  { name: 'Asia Pacific (Hong Kong)', id: 'ap-east-1' },
  { name: 'Asia Pacific (Mumbai)', id: 'ap-south-1' },
  { name: 'Asia Pacific (Tokyo)', id: 'ap-northeast-1' },
  { name: 'Asia Pacific (Seoul)', id: 'ap-northeast-2' },
  { name: 'Asia Pacific (Osaka)', id: 'ap-northeast-3' },
  { name: 'Asia Pacific (Singapore)', id: 'ap-southeast-1' },
  { name: 'Asia Pacific (Sydney)', id: 'ap-southeast-2' },
  { name: 'Canada (Central)', id: 'ca-central-1' },
  { name: 'China (Beijing)', id: 'cn-north-1' },
  { name: 'China (Ningxia)', id: 'cn-northwest-1' },
  { name: 'Africa (Cape Town)', id: 'af-south-1' },
  { name: 'Middle East (Bahrain)', id: 'me-south-1' },
  { name: 'South America (São Paulo)', id: 'sa-east-1' },
  { name: 'AWS GovCloud (US-East)', id: 'us-gov-east-1' },
  { name: 'AWS GovCloud (US-West)', id: 'us-gov-west-1' },
];

// const tabColors = [ 'grey', 'yellow', 'blue', 'purple', 'green', 'red', 'pink', 'cyan' ];
const tabColors = ['grey', 'yellow', 'blue', 'purple', 'green', 'red'];

const getRegionByKey = (key) => AWS_ACCOUNTS.find((reg) => reg.id === key);
const getRegionKeys = () => AWS_ACCOUNTS.map((reg) => reg.id);
const getColorForRegion = (region) => {
  const index = AWS_ACCOUNTS.findIndex((reg) => reg.id === region.id);
  const color = tabColors[index % tabColors.length];
  return color;
};

const assignGroupIdsForRegions = async () => {
  for (const reg of AWS_ACCOUNTS) {
    await getOrCreateGroupIdForRegion(reg);
  }
};

const getOrCreateGroupIdForRegion = async (reg) => {
  const key = `region:${reg.id}:groupId`;
  const result = await get(key);
  if (!result) {
    const newId = 90000 + Math.floor(Math.random() * 10000);
    await set(key, newId);
    return newId;
  }
  return result[key];
};

const getGroupIdForRegion = async (windowId, reg) => {
  const key = `window:${windowId}:region:${reg.id}:groupId`;
  const result = await get(key);
  if (!result) {
    return undefined;
  }
  return result[key];
};

const setGroupIdForRegion = async (reg, windowId, groupId) => {
  const key = `window:${windowId}:region:${reg.id}:groupId`;
  await set(key, groupId);
};

const assignAllTabsInWindow = async (acc_id) => {
  const tabs = await chrome.tabs.query({ status: 'complete' });
  for (const tab of tabs) {
    await handleTab(tab.id, acc_id);
  }
};

// Return region if aws and region found
const checkForAwsAccount = (acc_id, url) => {
  console.log('AWS_ACCOUNTS', AWS_ACCOUNTS);
  console.log('checkForAwsRegion', acc_id, url);
  if (acc_id === false) return null;
  // Would be more robust to parse url but whatevs
  const isAws = url.includes('console.aws.amazon.com');
  const isAwsAcc = acc_id.includes('-');
  if (!isAwsAcc) {
    console.log('Not an AWS account', acc_id);
    return null;
  }
  if (!isAws) {
    console.log('Not an AWS Website', url, isAws);
    return null;
  }
  const regionMatch = AWS_ACCOUNTS.find((reg) => {
    console.log('regionMatch', reg, acc_id, url);
    return acc_id.includes(reg.id);
  });
  return regionMatch || null;
};

const updateTabGroupForRegion = async (groupId, region) => {
  if (chrome.tabGroups) {
    const color = getColorForRegion(region);
    chrome.tabGroups.update(groupId, { title: region.id, color });
  }
};

const getOrCreateTabGroup = async (windowId, tabId, existingGroupId) => {
  const createProperties = existingGroupId ? undefined : { windowId };
  let groupId;
  try {
    groupId = await chrome.tabs.group({
      tabIds: tabId,
      groupId: existingGroupId,
      createProperties,
    });
  } catch (e) {
    const createProperties = { windowId };
    groupId = await chrome.tabs.group({ tabIds: tabId, createProperties });
  }
  return groupId;
};

const handleTab = async (tabId, acc_id = false) => {
  const tab = await chrome.tabs.get(tabId);
  const windowId = tab.windowId;
  const region = tab.url ? checkForAwsAccount(acc_id, tab.url) : null;
  console.log('handleTab', tabId, acc_id, region);
  if (region) {
    const existingGroupId = await getGroupIdForRegion(windowId, region);
    const groupId = await getOrCreateTabGroup(windowId, tabId, existingGroupId);
    updateTabGroupForRegion(groupId, region);
    await setGroupIdForRegion(region, windowId, groupId);
  }
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    console.log('chrome.runtime.onMessage.addListener', sender.tab);
    let tab = sender.tab;
    if (request.action === 'getSource') {
      let { acc_id, region } = request.source;
      const regex = /\d{4}-\d{4}-\d{4}/gm;
      let m = regex.exec(acc_id);
      if (m) {
        acc_id = m[0];
        console.log('Amazon Account ID: ', acc_id.replace('Account ID: ', ''));
        let acc_id_exist = AWS_ACCOUNTS.find((reg) => reg.id === acc_id);
        if (!acc_id_exist) {
          AWS_ACCOUNTS.push({
            name: `${region}-${acc_id.replace('Account ID: ', '')}`,
            id: `${region}-${acc_id.replace('Account ID: ', '')}`,
          });
        }

        handleTab(tab.id, `${region}-${acc_id.replace('Account ID: ', '')}`);
      }
      // assignAllTabsInWindow(`${region}-${acc_id.replace('Account ID: ', '')}`);
    }
  } catch (e) {
    console.error(e.stack);
  }
});

chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
  const { tabId, url, frameId } = details;
  console.log('chrome.webNavigation.onDOMContentLoaded tabId url', tabId, url);
  handleTab(tabId);
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  console.log(chrome.tabs.get(tabId));
  handleTab(tabId);
});

// Scan all existing tabs and assign them
// assignAllTabsInWindow();

// chrome.action.onClicked.addListener((tab) => {
//   assignAllTabsInWindow();
// });
