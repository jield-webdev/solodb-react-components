import moment from "moment";

const DateFormat = ({ children, format = "d-M-Y" }: { children: string; format: string }) => {
  const parsedDate = Date.parse(children);

  return <>{moment(parsedDate).format(format)}</>;
};

export default DateFormat;
