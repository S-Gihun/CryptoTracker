import { useQuery } from "react-query";
import { fetchCoinHistory } from "./api";
import styled from "styled-components";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const PriceBox = styled.div`
  width: 200px;
  height: 100px;
  background-color: ${(props) => props.theme.bgColor};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  margin: 0 auto;
  border-radius: 10px;
  span {
    color: red;
  }
`;

interface ChartProps {
  coinId: string;
}

interface IHistorical {
  time_open: number;
  time_close: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  market_cap: number;
}

function Price({ coinId }: ChartProps) {
  const { isLoading, data, error } = useQuery<IHistorical[]>(
    ["price", coinId],
    () => fetchCoinHistory(coinId)
  );

  function calculatePercentChange(currentPrice: number, previousPrice: number) {
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  // 로딩 중이거나 에러가 발생한 경우
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // 데이터가 없거나 비어있는 경우
  if (!data || data.length === 0) return <div>No data available</div>;

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30분 전 시간

  // 가장 최근 데이터와 30분 전, 1시간 전 데이터 찾기
  const recentData = data[data.length - 1];
  const previousData30Minutes = data.find((d) => {
    const closeTime = new Date(d.time_close * 1000); // 유닉스 타임스탬프를 밀리초로 변환
    return closeTime <= thirtyMinutesAgo;
  });

  // 백분율 변화율 계산
  const percentChange30Minutes =
    recentData && previousData30Minutes
      ? calculatePercentChange(
          parseFloat(recentData.close),
          parseFloat(previousData30Minutes.close)
        )
      : null;

  return (
    <>
      <Container>
        <PriceBox>
          <span>30분 변화율:</span>
          <span>
            {percentChange30Minutes !== null
              ? percentChange30Minutes.toFixed(2) + "%"
              : "No data available"}
          </span>
        </PriceBox>
      </Container>
    </>
  );
}

export default Price;
