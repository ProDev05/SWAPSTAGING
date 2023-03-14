import { parse, ParsedQs } from "qs";
import { useMemo } from "react";
import { useRouter } from "next/router";

export default function useParsedQueryString(): ParsedQs {
  const { query } = useRouter();
  const search = JSON.stringify(query);
  return useMemo(
    () =>
      search && search.length > 1
        ? parse(search, { parseArrays: false, ignoreQueryPrefix: true })
        : {},
    [search]
  );
}
