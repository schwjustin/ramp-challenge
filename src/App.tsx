import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } =
    usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } =
    useTransactionsByEmployee();
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData();

    await paginatedTransactionsUtils.fetchAll();
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  // load all employees
  const loadAllEmployees = useCallback(async () => {
    // only change loading state of dropdown when employees are being fetched independently of transactions
    setIsEmployeesLoading(true);

    await employeeUtils.fetchAll();

    setIsEmployeesLoading(false);
  }, [employeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData();
      await transactionsByEmployeeUtils.fetchById(employeeId);
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllEmployees();
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllEmployees, loadAllTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return;
            } else if (newValue === EMPTY_EMPLOYEE) {
              // if empty employee, load all transactions
              await loadAllTransactions();
              return;
            }

            await loadTransactionsByEmployee(newValue.id);
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />
          
          {paginatedTransactions && paginatedTransactions.nextPage && (
            // only show view more button for paginated transactions with a next page
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
