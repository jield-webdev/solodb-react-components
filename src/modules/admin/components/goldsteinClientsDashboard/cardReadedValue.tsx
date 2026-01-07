type Props = {
  badge_uuid: string;
};

export default function CardRead({ badge_uuid }: Props) {
  return <span className="rounded p-2 bg-success">Card read: {badge_uuid}</span>;
}
