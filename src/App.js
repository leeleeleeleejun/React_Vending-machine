import styled from 'styled-components';
import { Reset } from 'styled-reset';
import logoImg from 'img/logo.png';
import Original_Cola_Img from 'img/Original_Cola.png';
import Violet_Cola_Img from 'img/Violet_Cola.png';
import Yellow_Cola_Img from 'img/Yellow_Cola.png';
import Cool_Cola_Img from 'img/Cool_Cola.png';
import Green_Cola_Img from 'img/Green_Cola.png';
import Orange_Cola_Img from 'img/Orange_Cola.png';
import Chicken_Img from 'img/Chicken.png';
import Pizza_Img from 'img/Pizza.png';
import Hamburger_Img from 'img/Hamburger.png';
import Article from 'components/Article';
import MenuList from 'components/in/menuList';
import VendingMachineEffect from 'components/common/VendingMachineEffect';
import VendingMachineBalance from 'components/in/VendingMachineBalance';
import EffectButton from 'components/common/EffectButton';
import GlobalStyle from 'components/GlobalStyle';
import Input from 'components/common/Input';
import DepositButtonWrap from 'components/in/DepositButtonWrap';
import BasketList from 'components/in/BasketList';
import Amount from 'components/common/Amount';
import MyMoney from 'components/out/MyMoney,Coin';
import SortButton from 'components/out/SortButton';
import MyColaList from 'components/out/MyColaList';
import MyColaTitle from 'components/out/MyColaTitle';
import Guide from 'components/common/Guide';
import { useState, useReducer, useEffect, useRef, useCallback } from 'react';

const Wrap = styled.div`
  background-color: #eae8fe;
  line-height: 1;
  padding-bottom: 1px;
  font-family: 'Noto Sans KR', sans-serif;
`;

const Logo = styled.h1`
  top: 0;
  width: 100%;
  max-width: 386px;
  height: 180px;
  background: no-repeat center / 100% 100% url(${logoImg});
  margin: 0 auto;
`;

const Section = styled.section`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  margin: 67px 0;
  gap: 0 28px;
`;

const FalseLine = styled.div`
  margin-top: 9px;
  height: 20px;
  width: 360px;
  background-color: #eae8fe;
  margin-left: -27px;
  overflow: visible;
`;

const productList = [
  { name: 'Original_Cola', price: 1000, id: 1, img: Original_Cola_Img },
  { name: 'Violet_Cola', price: 1000, id: 2, img: Violet_Cola_Img },
  { name: 'Yellow_Cola', price: 1000, id: 3, img: Yellow_Cola_Img },
  { name: 'Cool_Cola', price: 1000, id: 4, img: Cool_Cola_Img },
  { name: 'Green_Cola', price: 1000, id: 5, img: Green_Cola_Img },
  { name: 'Orange_Cola', price: 1000, id: 6, img: Orange_Cola_Img },
  { name: 'Chicken', price: 4000, id: 7, img: Chicken_Img },
  { name: 'Pizza', price: 5000, id: 8, img: Pizza_Img },
  { name: 'Hamburger', price: 6000, id: 9, img: Hamburger_Img },
];
//잔액, 잔여코인 관련 리듀서
const setInCashReducer = (state, action) => {
  //아래 변수 useRef 적용 가능성 확인 필요
  const {
    type,
    price,
    useCoinCount,
    basketTotal,
    inputForm,
    outCash,
    setOutCash,
  } = action;
  let depositInputValue = Number(inputForm.deposit);

  const depositHandle = (outCashPara, inCashPara) => {
    if (inputForm.deposit > 0 && inputForm.deposit <= outCash[outCashPara]) {
      return {
        ...state,
        [inCashPara]: Number(state[inCashPara]) + Number(depositInputValue),
      };
    } else if (inputForm.deposit <= 0) {
      alert('다시입력해주세요');
      return state;
    } else {
      alert(
        `${(
          inputForm.deposit - outCash[outCashPara]
        ).toLocaleString()}원이 부족합니다`
      );
      return state;
    }
  };

  const returnCashHandle = (outCashPara, inCashPara) => {
    setOutCash((prev) => ({
      ...prev,
      [outCashPara]: prev[outCashPara] + state[inCashPara],
    }));
    return {
      ...state,
      [inCashPara]: 0,
    };
  };

  switch (type) {
    case 'DEPOSIT_COIN':
      return depositHandle('outCoin', 'inCoin');
    case 'DEPOSIT_MONEY':
      return depositHandle('outMoney', 'inMoney');
    case 'RETURN_COIN':
      return returnCashHandle('outCoin', 'inCoin');
    case 'RETURN_MONEY':
      return returnCashHandle('outMoney', 'inMoney');

    case 'GET_ITEM_IN_BASKET_ALL_COIN':
      return {
        ...state,
        inCoin: Number(state.inCoin) - Number(price / 1000),
      };
    case 'GET_ITEM_IN_BASKET_BOTH_COIN_MONEY':
      return {
        inMoney:
          Number(state.inMoney) - (Number(price) - Number(state.inCoin) * 1000),
        inCoin: 0,
      };
    case 'DELETE_ITEM_IN_BASKET':
      if (useCoinCount >= price / 1000) {
        return {
          ...state,
          inCoin: Number(state.inCoin) + Number(price / 1000),
        };
      } else
        return {
          inMoney:
            Number(state.inMoney) +
            (Number(price) - Number(useCoinCount) * 1000),
          inCoin: Number(state.inCoin) + Number(useCoinCount),
        };
    case 'SALE_RETURN':
      return {
        ...state,
        inMoney: Number(state.inMoney) + Number(basketTotal * 0.15),
      };
    default:
      return state;
  }
};

//바스켓에 담긴 아이템들의 수량 초기화
const basketListItemCount = (() => {
  const initialValue = {};
  productList.forEach((item) => (initialValue[item.name] = 0));
  return initialValue;
})();

//바스켓에 담긴 아이템들 중 어떤 아이템이 얼마나 코인을 썻는지 파악 초기화
const basketListUseCoinCount = (() => {
  const initialValue = {};
  productList.forEach((item) => (initialValue[item.name] = 0));
  return initialValue;
})();
//장바구니 관련 리듀서
const setItemInBasket = (state, action) => {
  const { item, type, inCash, inputForm, setInCashState } = action;
  const addOrIncrease = (useCoinCountPara) => {
    state = {
      itemInList:
        state.count[item.name] === 0
          ? [...state.itemInList, item]
          : state.itemInList,
      count: {
        ...state.count,
        [item.name]: ++state.count[item.name],
      },
      useCoinCount: {
        ...state.useCoinCount,
        [item.name]:
          Number(state.useCoinCount[item.name]) + Number(useCoinCountPara),
      },
    };
  };

  switch (type) {
    case 'GET_BASKET':
      if (inCash.inCoin >= item.price / 1000) {
        addOrIncrease(item.price / 1000);
        // 사용한 코인 갯수 파악을 위한 카운트 (아이템 취소 시 사용한 만큼의 코인 반환 필요)
        setInCashState({
          type: 'GET_ITEM_IN_BASKET_ALL_COIN',
          price: item.price,
          inputForm: inputForm,
        });
      } else if (inCash.inCoin * 1000 + inCash.inMoney >= item.price) {
        addOrIncrease(inCash.inCoin);
        // 사용한 코인 갯수 파악을 위한 카운트 (아이템 취소 시 사용한 만큼의 코인 반환 필요)
        setInCashState({
          type: 'GET_ITEM_IN_BASKET_BOTH_COIN_MONEY',
          price: item.price,
          inputForm: inputForm,
        });
      }
      return { ...state };

    case 'DELETE_ITEM':
      setInCashState({
        type: 'DELETE_ITEM_IN_BASKET',
        price: item.price,
        useCoinCount: state.useCoinCount[item.name],
        inputForm: inputForm,
      });
      if (state.count[item.name] > 1)
        return {
          ...state,
          count: {
            ...state.count,
            [item.name]: --state.count[item.name],
          },
          useCoinCount: {
            ...state.useCoinCount,
            [item.name]:
              // 코인으로 모두 결제 또는 부분결제(현금+코인) 인지 구분 필요
              state.useCoinCount[action.item.name] > item.price / 1000
                ? state.useCoinCount[action.item.name] - item.price / 1000
                : 0,
          },
        };
      else
        return {
          itemInList: [...state.itemInList].filter((i) => {
            return i.name !== action.item.name;
          }),
          count: {
            ...state.count,
            [action.item.name]: --state.count[action.item.name],
          },
          useCoinCount: {
            ...state.useCoinCount,
            [action.item.name]: 0,
          },
        };
    case 'GET_INVENTORY':
      return {
        itemInList: [],
        count: basketListItemCount,
        useCoinCount: basketListUseCoinCount,
      };
    default:
      return state;
  }
};

const App = () => {
  const [inputForm, setInputForm] = useState({
    deposit: '',
    changeCoin: '',
  });

  const inputHandleChange = (e) => {
    setInputForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [outCash, setOutCash] = useState({
    outMoney: 25000,
    outCoin: 0,
  });

  const [inCash, setInCashState] = useReducer(setInCashReducer, {
    inMoney: 0,
    inCoin: 0,
  });

  useEffect(() => {
    setInputForm((prev) => ({
      ...prev,
      deposit: '',
    }));
  }, [inCash]);

  useEffect(() => {
    setInputForm((prev) => ({
      ...prev,
      changeCoin: '',
    }));
  }, [outCash]);

  // 자판기에 코인을 입금 시 소지 코인을 렌더링하는 Effect
  useEffect(() => {
    if (inCash.inCoin > 0) {
      setOutCash((prev) => ({
        ...prev,
        outCoin: Number(prev.outCoin) - Number(inputForm.deposit),
      }));
    }
  }, [inCash.inCoin, inputForm.deposit]);

  // 자판기에 현금을 입금 시 소지 금액을 렌더링하는 Effect
  useEffect(() => {
    if (inCash.inMoney > 0) {
      setOutCash((prev) => ({
        ...prev,
        outMoney: Number(prev.outMoney) - Number(inputForm.deposit),
      }));
    }
  }, [inCash.inMoney, inputForm.deposit]);

  const CoinChangeHandle = (e) => {
    e.preventDefault();
    if (
      outCash.outMoney > inputForm.changeCoin * 900 &&
      inputForm.changeCoin > 0
    ) {
      setOutCash((prev) => ({
        outMoney: prev.outMoney - inputForm.changeCoin * 900,
        outCoin: Number(prev.outCoin) + Number(inputForm.changeCoin),
      }));
    } else if (inputForm.changeCoin <= 0) {
      alert('다시입력해주세요');
      setInputForm((prev) => ({
        ...prev,
        changeCoin: '',
      }));
    } else {
      alert(
        `${(
          inputForm.changeCoin * 900 -
          outCash.outMoney
        ).toLocaleString()}원이 부족합니다`
      );
      setInputForm((prev) => ({
        ...prev,
        changeCoin: '',
      }));
    }
  };

  const [basketList, setBasketList] = useReducer(setItemInBasket, {
    itemInList: [],
    // 컴포넌트 밖에서 실행된 함수
    count: basketListItemCount,
    useCoinCount: basketListUseCoinCount,
  });

  const [basketTotal, setBasketTotal] = useState(0);
  const inventoryTotal = useRef(0);
  useEffect(() => {
    setBasketTotal(() => {
      if (basketList.itemInList.length > 0) {
        return basketList.itemInList.reduce(
          (a, b) => a + b.price * basketList.count[b.name],
          0
        );
      } else return 0;
    });
  }, [basketList, basketTotal]);

  const itemInInventoryCount = {};
  productList.forEach((item) => (itemInInventoryCount[item.name] = 0));

  const [itemInInventory, setItemInInventory] = useState({
    itemInList: [],
    itemInInventoryCount,
  });

  const addBasketHandle = useCallback(
    (item) => {
      setBasketList({
        type: 'GET_BASKET',
        item: item,
        setInCashState: setInCashState,
        inputForm: inputForm,
        inCash: inCash,
      });
    },
    [inputForm, inCash]
  );

  const cancelButtonHandle = useCallback(
    (item) => {
      setBasketList({
        type: 'DELETE_ITEM',
        item: item,
        setInCashState: setInCashState,
        inputForm: inputForm,
      });
    },
    [inputForm]
  );

  const [dragAndDropToggle, setDragAndDropToggle] = useState(false);

  return (
    <>
      <GlobalStyle />
      <Reset />
      <Wrap>
        <Logo></Logo>
        <Section>
          <Article>
            {/*메뉴리스트*/}
            <MenuList
              item={productList}
              addBasketHandle={addBasketHandle}
              cancelButtonHandle={cancelButtonHandle}
              inCoinState={inCash.inCoin}
              inMoneyState={inCash.inMoney}
            />
            <Guide>
              1코인 = 1,000원
              <br />
              *코인을 우선하여 사용합니다.
            </Guide>
            {/*잔액 표시 및 잔액반환 버튼*/}
            <VendingMachineEffect>
              <VendingMachineBalance
                text1="잔액 :"
                text2="원"
                number={inCash.inMoney}
              />
              <EffectButton
                onClick={() => {
                  setInCashState({
                    type: 'RETURN_MONEY',
                    setOutCash: setOutCash,
                  });
                }}
              >
                잔액 반환
              </EffectButton>
            </VendingMachineEffect>
            {/*잔여 코인 표시 및 코인반환 버튼*/}
            <VendingMachineEffect>
              <VendingMachineBalance
                text1="잔여 코인 :"
                text2="개"
                number={inCash.inCoin}
              />
              <EffectButton
                onClick={() => {
                  setInCashState({
                    type: 'RETURN_COIN',
                    setOutCash: setOutCash,
                  });
                }}
              >
                코인 반환
              </EffectButton>
            </VendingMachineEffect>
            {/*입금 입력 및 버튼*/}
            <VendingMachineEffect>
              <Input
                placeholder="입금 금액 입력"
                name="deposit"
                value={inputForm.deposit}
                onChange={inputHandleChange}
                type="number"
              />
              <DepositButtonWrap
                onCoinDeposit={() => {
                  setInCashState({
                    type: 'DEPOSIT_COIN',
                    inputForm: inputForm,
                    outCash: outCash,
                  });
                }}
                onMoneyDeposit={() => {
                  setInCashState({
                    type: 'DEPOSIT_MONEY',
                    inputForm: inputForm,
                    outCash: outCash,
                  });
                }}
              />
            </VendingMachineEffect>
            {/*장바구니 및 획득버튼*/}
            <VendingMachineEffect>
              <BasketList
                basketListItem={basketList.itemInList}
                basketListCount={basketList.count}
                isBasket
                cancelButtonHandle={cancelButtonHandle}
              />
              <EffectButton
                plus="getButton"
                // basketTotal은 basketList가 변경될 때 useEffect로 변경되는 useRef이다.
                // useEffect는 비동기로 해당 이벤트 코드가 처리되고 마지막에 처리된다.
                // 그러므로 값이 마지막에 변경이 되었으나 useRef의 특성으로 변경이 되어도 화면이 렌더링되지 않음
                onClick={() => {
                  setBasketList({ type: 'GET_INVENTORY' });
                  if (basketTotal >= 10000) {
                    setInCashState({
                      type: 'SALE_RETURN',
                      basketTotal: basketTotal,
                      inputForm: inputForm,
                    });
                    inventoryTotal.current += basketTotal - basketTotal * 0.15;
                  } else {
                    inventoryTotal.current += basketTotal;
                  }
                  setItemInInventory(() => {
                    for (let i = 0; i < basketList.itemInList.length; i++) {
                      if (
                        itemInInventory.itemInList.includes(
                          basketList.itemInList[i]
                        )
                      ) {
                        itemInInventory.itemInInventoryCount[
                          basketList.itemInList[i].name
                        ] += basketList.count[basketList.itemInList[i].name];
                      } else {
                        itemInInventory.itemInList.push(
                          basketList.itemInList[i]
                        );
                        itemInInventory.itemInInventoryCount[
                          basketList.itemInList[i].name
                        ] += basketList.count[basketList.itemInList[i].name];
                      }
                    }
                    return {
                      ...itemInInventory,
                    };
                  });
                }}
              >
                획득
              </EffectButton>
            </VendingMachineEffect>
            {/*총금액 및 할인금액*/}
            <>
              <Amount
                text1="총금액: "
                number={(basketTotal >= 10000
                  ? basketTotal - basketTotal * 0.15
                  : basketTotal
                ).toLocaleString()}
                text2="원"
              />
              <Amount
                text1="할인된 금액: "
                number={(basketTotal >= 10000
                  ? basketTotal * 0.15
                  : 0
                ).toLocaleString()}
                text2="원"
              />
              <Guide>* 10,000 원 이상 구매 시 15% 할인</Guide>
            </>
          </Article>
          <Article>
            {/*소지금, 소지코인, 코인변환버튼*/}
            <MyMoney text1="소지금" text2="원" number={outCash.outMoney} />
            <VendingMachineEffect>
              <Input
                type="number"
                placeholder="코인 수량 입력"
                name="changeCoin"
                value={inputForm.changeCoin}
                onChange={inputHandleChange}
              />
              <EffectButton onClick={CoinChangeHandle}>코인 변환↓</EffectButton>
            </VendingMachineEffect>
            <Guide>1코인 = 900원</Guide>
            <MyMoney
              text1="소지코인"
              text2="코인"
              number={outCash.outCoin}
              coin
            />
            {/*구분 선*/}
            <FalseLine />
            {/*정렬버튼*/}
            <VendingMachineEffect myCola>
              <MyColaTitle>획득한 음료</MyColaTitle>
              <SortButton
                setItemInInventory={setItemInInventory}
                dragAndDropToggle={dragAndDropToggle}
                setDragAndDropToggle={setDragAndDropToggle}
              />
            </VendingMachineEffect>
            <MyColaList
              itemInInventory={itemInInventory}
              setItemInInventory={setItemInInventory}
              dragAndDropToggle={dragAndDropToggle}
            />
            <Amount
              text1="총금액: "
              text2="원"
              align
              number={inventoryTotal.current.toLocaleString()}
            />
          </Article>
        </Section>
      </Wrap>
    </>
  );
};

export default App;
