import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import './Fix';
import './Popup.css';
import RuleForm from './RuleForm';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { get, set } from './utils';
import UpgradeNotice from './UpgradeNotice';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import TabIcon from '@material-ui/icons/Tab';
import debounce from 'lodash.debounce';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const DARK_BLUE = '#282C34';
const ACID_GREEN = '#12FA73';

const GlobalStyle = createGlobalStyle`
  html {
    background-color: #282C34;
  }

  body {
    width: 40rem;
    min-height: 20rem;
    color: white;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #dynamic_form_item {
    width: 100%;
  }

  .ant-btn {
    cursor: pointer;
  }

  .MuiTab-textColorPrimary.Mui-selected {
    color: ${ACID_GREEN};
  }

  .MuiTabs-indicator {
    background-color: ${ACID_GREEN};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
`;

const initialRules = [];

const rule = (key = 0, pattern = '', name = 'rule') => ({ key, pattern, name });
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

const updateBackground = debounce(() => {
  chrome.runtime.sendMessage({ updated: true });
}, 250);

const collapseBackground = debounce((state) => {
  chrome.runtime.sendMessage({ collapse: state, expand: !state });
}, 100);

const Popup = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [groupRules, setGroupRules] = useState([]);
  const [formKey, setFormKey] = useState('initial');
  const [value, setValue] = useState(0);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(async () => {
    const { groupRules } = await get('groupRules');
    const { hasConfirmed } = await get('hasConfirmed');
    setHasConfirmed(hasConfirmed);
    setGroupRules(groupRules || []);
    setIsLoading(false);
  }, []);

  const rerenderForm = () => {
    const rand = Math.floor(Math.random() * 1000);
    setFormKey(`form-${rand}`);
  };

  const saveGroupRules = async (rules, shouldRefresh = false) => {
    const rulesWithIds = rules.map((r) => {
      if (r.id) return r;
      r.id = getRandomInt(100000);
      return r;
    });
    await set('groupRules', rulesWithIds);
    setGroupRules(rulesWithIds);
    updateBackground();
    if (shouldRefresh) rerenderForm();
  };

  const confirmInitial = async () => {
    set('hasConfirmed', true);
    logNewUserEvent();
    await saveGroupRules(initialRules, true);
    setTimeout(updateBackground(), 3000);
    setHasConfirmed(true);
  };

  const upgradeNeeded = !chrome.tabGroups;
  const renderMain = () => {
    if (upgradeNeeded) return <UpgradeNotice version />;
    if (isLoading) return '';
    switch (value) {
      case 0:
        return (
          <>
            <RuleForm
              key={formKey}
              groupRules={groupRules}
              saveGroupRules={saveGroupRules}
              handleCollapseGroups={collapseBackground}
              handleReload={updateBackground}
              showConfirm={!hasConfirmed}
              handleConfirm={confirmInitial}
            />
          </>
        );
    }
  };
  // return null;
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <GlobalStyle />
        <Wrapper>
          <ContentWrapper>{renderMain()}</ContentWrapper>
        </Wrapper>
      </div>
    </ThemeProvider>
  );
};

export default Popup;
