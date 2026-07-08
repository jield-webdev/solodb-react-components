import { formatDate } from "@jield/solodb-react-components/utils/datetime";

const DateFormat = ({ children, format = "d-M-Y" }: { children: string; format: string }) => {
  return <>{formatDate(children, format)}</>;
};

export default DateFormat;
