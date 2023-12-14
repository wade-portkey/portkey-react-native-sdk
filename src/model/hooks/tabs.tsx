import { AELFColors } from 'assets/theme';
import React, { FC, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

export const RNTabView = (config: UseTabConfig) => {
  const { tabs } = config;
  const [index, setIndex] = useState(0);
  const [routes] = useState(tabs.map(item => ({ key: item.key, title: item.title })));
  const sceneMap = useMemo(() => {
    const sceneProps: SceneMap = {};
    tabs.forEach(item => {
      sceneProps[item.key] = item.component;
    });
    return SceneMap(sceneProps);
  }, [tabs]);
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={sceneMap}
      onIndexChange={setIndex}
      initialLayout={{ width: 0, height: 0 }}
      renderTabBar={renderTabBar}
      style={styles.containerStyle}
    />
  );
};

const renderTabBar = (props: any) => {
  return (
    <TabBar
      {...props}
      getLabelText={scene => {
        return scene.route.title;
      }}
      activeColor={AELFColors.AELF}
      inactiveColor="black"
      tabStyle={styles.tabStyle}
      labelStyle={styles.labelFocused}
      indicatorStyle={styles.indicatorStyle}
      indicatorContainerStyle={styles.indicatorContainerStyle}
    />
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: -10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  labelFocused: {
    fontWeight: '400',
  },
  indicatorStyle: {
    backgroundColor: AELFColors.AELF,
  },
  indicatorContainerStyle: {
    backgroundColor: AELFColors.AELF,
  },
  tabStyle: {
    backgroundColor: 'white',
  },
});

export interface UseTabConfig {
  tabs: TabProps[];
  defaultTab?: string;
}

interface SceneMap {
  [key: string]: FC;
}

export interface TabProps {
  key: string;
  title: string;
  component: FC;
}
