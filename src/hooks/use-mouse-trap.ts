import React from "react";
import Mousetrap from "mousetrap";

type MousetrapParameters = Parameters<typeof Mousetrap.bind>;
export type Traps = {
  keys: MousetrapParameters[0];
  callback: MousetrapParameters[1];
  action?: MousetrapParameters[2];
}[];

export const useMousetrap = (traps: Traps, bind = true) => {
  React.useEffect(() => {
    if (bind) {
      traps.forEach(({ keys, callback, action }) =>
        Mousetrap.bind(keys, callback, action)
      );
      return () => {
        traps.forEach(({ keys }) => Mousetrap.unbind(keys));
      };
    }
  }, [traps, bind]);
};
