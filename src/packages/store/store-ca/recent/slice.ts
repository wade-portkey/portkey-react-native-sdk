import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RecentContactItemType } from 'packages/types/types-ca/contact';
import { fetchRecentTransactionUsers } from './api';

import { RECENT_LIST_PAGE_SIZE } from 'packages/constants/constants-ca/recent';
import { ChainId } from 'packages/types';

export interface RecentStateType {
  [caAddress: string]: {
    isFetching: boolean;
    totalRecordCount: number;
    skipCount: number;
    maxResultCount: number;
    recentContactList: RecentContactItemType[];
  };
}

export const initialState: RecentStateType = {};

export const fetchRecentListAsync = createAsyncThunk(
  'fetchRecentListAsync',
  async (
    {
      caAddress,
      caAddressInfos,
      isFirstTime = true,
    }: {
      caAddress: string;
      isFirstTime: boolean;
      caAddressInfos: { chainId: ChainId; chainName: string; caAddress: string }[];
    },
    { getState },
  ) => {
    const { recent } = getState() as { recent: RecentStateType };
    const { skipCount = 0 } = recent?.[caAddress] || {};

    const response = await fetchRecentTransactionUsers({
      caAddresses: [caAddress],
      caAddressInfos,
      skipCount: isFirstTime ? 0 : skipCount,
      maxResultCount: RECENT_LIST_PAGE_SIZE,
    });

    return { isFirstTime, caAddress, response };
  },
);

export const recentSlice = createSlice({
  name: 'recent',
  initialState,
  reducers: {
    initCurrentChainRecentData: (
      state,
      action: PayloadAction<{
        caAddress: string;
      }>,
    ) => {
      const { caAddress } = action.payload;
      state[caAddress] = {
        isFetching: false,
        skipCount: 0,
        maxResultCount: 10,
        totalRecordCount: 0,
        recentContactList: [],
      };
    },
    resetRecent: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(fetchRecentListAsync.fulfilled, (state, action) => {
      const { caAddress, isFirstTime, response } = action.payload;

      const targetData = state?.[caAddress] ?? {};
      targetData.isFetching = false;
      targetData.totalRecordCount = response?.totalRecordCount;
      targetData.skipCount += RECENT_LIST_PAGE_SIZE;

      if (isFirstTime) {
        // first Page
        targetData.skipCount = RECENT_LIST_PAGE_SIZE;
        targetData.recentContactList = response.data;
      } else {
        targetData.recentContactList = [...targetData.recentContactList, ...response.data];
      }

      state[caAddress] = targetData;
    });
  },
});

export const { resetRecent, initCurrentChainRecentData } = recentSlice.actions;

export default recentSlice;
