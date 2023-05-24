import { useContext, useState } from "react";
import { InputCheckbox } from "../InputCheckbox";
import { TransactionPaneComponent } from "./types";
import { AppContext } from "src/utils/context";
import { Transaction } from "src/utils/types";
import { TransactionsByEmployeeResult } from "src/hooks/types";

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const { cache } = useContext(AppContext);
  const [approved, setApproved] = useState(transaction.approved);

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={async (newValue) => {
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          });

          // update the cached transaction so that its approved value persists
          cache?.current.forEach((value, key) => {
            if (key.startsWith("paginatedTransactions") || key.startsWith("transactions")) {
              try {
                let parsedTransactions: TransactionsByEmployeeResult = JSON.parse(value);

                if (parsedTransactions.data) {
                  const transactionIndex = parsedTransactions.data.findIndex(
                    (cachedTransaction: Transaction) => transaction.id === cachedTransaction.id
                  );

                  if (transactionIndex !== -1) {
                    parsedTransactions.data[transactionIndex].approved = newValue;
                    cache.current.set(key, JSON.stringify(parsedTransactions));
                  }
                } else {
                  console.log("error parsing cached transactions");
                }
              } catch (error) {
                console.log(error);
              }
            }
          });

          setApproved(newValue);
        }}
      />
    </div>
  );
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
