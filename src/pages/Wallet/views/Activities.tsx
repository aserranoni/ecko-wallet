import { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { get, groupBy } from 'lodash';
import Pact from 'pact-lang-api';
import { useSelector } from 'react-redux';
import { DivFlex, SecondaryLabel } from 'src/components';
import { getApiUrl } from 'src/utils/chainweb';
import { setLocalActivities, getLocalActivities } from 'src/utils/storage';
import PopupDetailTransaction from './PopupDetailTransaction';
import FinishTransferItem from './FinishTransferItem';

const Div = styled.div`
  cursor: pointer;
`;
const DivChild = styled.div`
  margin-right: ${(props) => props.marginRight};
  color: ${(props) => props.color};
  font-size: ${(props) => props.fontSize};
`;

const DivScroll = styled.div`
  display: block;
`;

const DayLabel = styled(SecondaryLabel)`
  display: block;
  margin-top: 24px;
  padding: 0 24px;
  font-size: 12px;
  font-weight: 700;
`;

const Activities = () => {
  const [isShowDetailTxPopup, setShowDetailTxPopup] = useState(false);
  const [activityDetails, setActivityDetails] = useState<any>({});
  const rootState = useSelector((state) => state);
  const { account, chainId } = rootState.wallet;
  const { selectedNetwork } = rootState.extensions;
  const [list, setList] = useState<any[]>([]);
  const grouped = groupBy(list, (activity) => moment(activity.createdTime).format('DD/MM/YYYY'));

  const [isLoadData, setIsLoadData] = useState(true);

  useEffect(() => {
    getLocalActivities(
      selectedNetwork.networkId,
      account,
      (activities) => {
        const newActivityList = [...activities];
        newActivityList.sort((a: any, b: any) => {
          const createdDateA = new Date(a.createdTime);
          const createdDateB = new Date(b.createdTime);
          return Number(createdDateB) - Number(createdDateA);
        });
        setList(newActivityList);
        setIsLoadData(false);
        const pendingActivities = newActivityList.filter((c: any) => c.status === 'pending');
        if (pendingActivities && pendingActivities.length > 0) {
          const chainRequest = {};
          for (let i = 0; i < pendingActivities.length; i += 1) {
            const newActivity: any = pendingActivities[i];
            if (!chainRequest[newActivity.senderChainId] || chainRequest[newActivity.senderChainId].length < 1) {
              chainRequest[newActivity.senderChainId] = [];
            }
            chainRequest[newActivity.senderChainId].push(newActivity.requestKey);
          }
          const promiseList: any[] = [];
          const dataArr = Object.keys(chainRequest);
          for (let i = 0; i < dataArr.length; i += 1) {
            const newChainId = dataArr[i];
            const cmd = {
              requestKeys: chainRequest[newChainId],
            };
            const item = Pact.fetch.poll(cmd, getApiUrl(selectedNetwork.url, selectedNetwork.networkId, newChainId.toString()));
            promiseList.push(item);
          }
          Promise.all(promiseList)
            .then((res) => {
              if (res && res.length > 0) {
                let result = res[0];
                if (res.length > 1) {
                  for (let i = 1; i < res.length; i += 1) {
                    result = { ...result, ...res[i] };
                  }
                }
                const newList = newActivityList.map((activity: any) => {
                  if (result[activity.requestKey]) {
                    const status = get(result[activity.requestKey], 'result.status') || 'pending';
                    return { ...result[activity.requestKey], ...activity, status };
                  }
                  return activity;
                });
                setList(newList);
                setLocalActivities(selectedNetwork.networkId, account, newList);
              }
            })
            .catch(() => {});
        }
      },
      () => {
        setList([]);
        setIsLoadData(false);
      },
    );
  }, [account, chainId, selectedNetwork.networkId]);
  if (isLoadData) return <div />;

  const todayString = moment().format('DD/MM/YYYY');
  const yesterdayString = moment().subtract(1, 'days').format('DD/MM/YYYY');
  return (
    <Div>
      {list && list.length ? (
        <>
          <DivChild>
            <DivScroll>
              {grouped && grouped[todayString] && (
                <>
                  <DayLabel uppercase>Today</DayLabel>
                  {grouped[todayString].map((item) => {
                    if (!item || !item.receiverChainId) return null;
                    return (
                      <Div
                        style={{ padding: '0px 24px' }}
                        onClick={() => {
                          setShowDetailTxPopup(true);
                          setActivityDetails(item);
                        }}
                        key={item.createdTime}
                      >
                        <FinishTransferItem
                          createdTime={item.createdTime}
                          chainId={item.receiverChainId}
                          value={item.amount}
                          tokenType={item.symbol?.toUpperCase() ?? 'KDA'}
                          receiver={item.receiver}
                          domain={item.domain}
                          status={item.status}
                        />
                      </Div>
                    );
                  })}
                </>
              )}
              {grouped && grouped[yesterdayString] && (
                <>
                  <DayLabel uppercase>Yesterday</DayLabel>
                  {grouped[yesterdayString].map((item) => {
                    if (!item || !item.receiverChainId) return null;
                    return (
                      <Div
                        style={{ padding: '0px 24px' }}
                        onClick={() => {
                          setShowDetailTxPopup(true);
                          setActivityDetails(item);
                        }}
                        key={item.createdTime}
                      >
                        <FinishTransferItem
                          createdTime={item.createdTime}
                          chainId={item.receiverChainId}
                          value={item.amount}
                          tokenType={item.symbol?.toUpperCase() ?? 'KDA'}
                          receiver={item.receiver}
                          domain={item.domain}
                          status={item.status}
                        />
                      </Div>
                    );
                  })}
                </>
              )}
              {Object.keys(grouped)
                .filter((key) => key !== yesterdayString && key !== todayString)
                .map((date) => (
                  <>
                    <DayLabel uppercase>{moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY')}</DayLabel>
                    {grouped[date].map((item) => {
                      if (!item || !item.receiverChainId) return null;
                      return (
                        <Div
                          style={{ padding: '0px 24px' }}
                          onClick={() => {
                            setShowDetailTxPopup(true);
                            setActivityDetails(item);
                          }}
                          key={item.createdTime}
                        >
                          <FinishTransferItem
                            createdTime={item.createdTime}
                            chainId={item.receiverChainId}
                            value={item.amount}
                            tokenType={item.symbol?.toUpperCase() ?? 'KDA'}
                            receiver={item.receiver}
                            domain={item.domain}
                            status={item.status}
                          />
                        </Div>
                      );
                    })}
                  </>
                ))}
            </DivScroll>
          </DivChild>
        </>
      ) : (
        <DivFlex marginTop="200px">
          <SecondaryLabel textCenter style={{ flex: 1 }}>
            You have no transactions
          </SecondaryLabel>
        </DivFlex>
      )}
      {isShowDetailTxPopup && (
        <PopupDetailTransaction
          selectedNetwork={selectedNetwork}
          activityDetails={activityDetails}
          isOpen={isShowDetailTxPopup}
          title="Transaction Details"
          onCloseModal={() => setShowDetailTxPopup(false)}
        />
      )}
    </Div>
  );
};

export default Activities;
