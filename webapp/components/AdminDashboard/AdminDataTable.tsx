import {
  Box,
  Button,
  Checkbox,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Tab,
  Table,
  TableContainer,
  TabList,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { IconExternalLink, IconLockDollar } from "@tabler/icons-react";
import {
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  Row,
  Table as TableType,
  useReactTable,
  CellContext as TanCellContext,
  RowData,
} from "@tanstack/react-table";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils.js";
import React, { useEffect, useMemo, useState } from "react";

import TextWithClipboard from "../TextWithClipboard";

import DecryptionModal from "./DecryptionModal";

import {
  useBasicFevmDalnGetTokenInfo,
  useBasicFevmDalnGetTokenInfos,
} from "~~/generated/wagmiTypes";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    decryptSingleRow: (id: BigNumber) => void;
  }
}

type Item = {
  id: BigNumber;
  cid: string;
  isDecrypted: boolean;
  owner: string;
  price: BigNumber;
};

const columnHelper = createColumnHelper<Item>();

const columns = [
  {
    id: "select",
    header: ({ table }: { table: TableType<Item> }) => (
      <Checkbox
        sx={{
          bg: "white",
          borderRadius: "md",
        }}
        {...{
          isChecked: table.getIsAllRowsSelected(),
          isIndeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }: { row: Row<Item> }) => (
      <div className="px-1">
        <Checkbox
          {...{
            isChecked: row.getIsSelected(),
            isDisabled: !row.getCanSelect(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  },
  columnHelper.accessor("id", {
    header: () => "Token Id",
    cell: (item) => (
      <Flex>
        <Text>{item.getValue().toString()}</Text>
      </Flex>
    ),
  }),

  columnHelper.accessor("owner", {
    header: () => "Holder Wallet Address",
    cell: (item) => (
      <TextWithClipboard value={item.getValue()} truncateMaxLength={9} />
    ),
  }),
  columnHelper.accessor("cid", {
    header: () => "CID",
    cell: (item) => (
      <TextWithClipboard value={item.getValue()} truncateMaxLength={9} />
    ),
  }),
  columnHelper.accessor("price", {
    header: () => "Session Payment",
    cell: (item) => <Text>{formatUnits(item.getValue(), "ether")} FIL</Text>,
  }),
  columnHelper.accessor("isDecrypted", {
    header: () => "Status",
    cell: (item) => {
      const isDecrypted = item.getValue();

      if (isDecrypted) {
        return (
          <Button
            as={Link}
            isExternal
            href={`https://decrypt.mesh3.network/${item.row.getValue("cid")}`}
            rightIcon={<IconExternalLink size={16} />}
            size="sm"
            variant="link"
          >
            Decrypted
          </Button>
        );
      }

      return (
        <Tooltip label="Click to decrypt">
          <Button
            onClick={() =>
              item.table.options.meta?.decryptSingleRow(item.row.getValue("id"))
            }
            rightIcon={<IconLockDollar size={16} />}
            size="sm"
            colorScheme="yellow"
          >
            Encrypted
          </Button>
        </Tooltip>
      );
    },
  }),
];

const isDecryptedFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const isDecrypted = value === "Decrypted";
  if (value) {
    return row.getValue("isDecrypted") === isDecrypted;
  }
  return true;
};

export default function AdminDataTable() {
  const getTokenInfos = useBasicFevmDalnGetTokenInfos({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [BigNumber.from(0), BigNumber.from(10)],
    watch: true,
  });

  const tokenInfos = useMemo(() => {
    if (!getTokenInfos.data?.[0] || !getTokenInfos.isSuccess) return [];
    return getTokenInfos.data[0].map(
      ({ cid, isDecrypted, owner, id, price }) => ({
        id,
        cid,
        isDecrypted,
        owner,
        price,
      })
    );
  }, [getTokenInfos.data, getTokenInfos.isSuccess]);

  const [rowSelection, setRowSelection] = React.useState({});

  const [tokensToDecrypt, setTokensToDecrypt] = useState<
    NonNullable<ReturnType<typeof useBasicFevmDalnGetTokenInfo>["data"]>[]
  >([]);

  const [statusFilter, setStatusFilter] = React.useState<
    null | "Decrypted" | "Encrypted"
  >(null);

  const handleTabsChange = (index: number) => {
    switch (index) {
      case 0:
        setStatusFilter(null);
        break;
      case 1:
        setStatusFilter("Encrypted");
        break;
      case 2:
        setStatusFilter("Decrypted");
        break;
      default:
        setStatusFilter(null);

        break;
    }
  };

  const table = useReactTable({
    data: tokenInfos,
    columns,
    state: {
      rowSelection,
      globalFilter: statusFilter,
    },
    enableRowSelection: (row) => {
      return !row.getValue("isDecrypted");
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: isDecryptedFilterFn,
    onGlobalFilterChange: setStatusFilter,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      isDecryptedFilterFn,
    },
    meta: {
      decryptSingleRow: (id: BigNumber) => {
        const token = tokenInfos.find((token) => token.id === id);
        if (!token) return;
        setTokensToDecrypt([token]);
      },
    },
  });

  const rowSelectedIds = Object.keys(rowSelection);

  const totalPayment = useMemo(
    () =>
      rowSelectedIds.reduce((acc, id) => {
        let price = BigNumber.from(0);
        try {
          price = table.getRow(id).original.price;
        } catch (e) {
          price = BigNumber.from(0);
        }
        return acc.add(price);
      }, BigNumber.from(0)),
    [rowSelectedIds, table]
  );

  const rowSelectedqty = rowSelectedIds.length;

  const onDecryptMultiple = () => {
    const newTokensToDecrypt = rowSelectedIds
      .map((id) =>
        tokenInfos.find((token) => token.id === table.getRow(id).original.id)
      )
      .filter(Boolean) as NonNullable<
      ReturnType<typeof useBasicFevmDalnGetTokenInfo>["data"]
    >[];
    if (newTokensToDecrypt.length > 0) {
      setTokensToDecrypt(newTokensToDecrypt);

      table.resetRowSelection();
    }
  };

  const onCloseDecryptModal = () => {
    setTokensToDecrypt([]);
  };

  return (
    <>
      <TableContainer>
        <Flex marginBottom={3} alignItems="center">
          <Tabs onChange={handleTabsChange}>
            <TabList>
              <Tab>All data</Tab>
              <Tab>Encrypted data</Tab>
              <Tab>Decrypted data</Tab>
            </TabList>
          </Tabs>
          <Spacer />
          {rowSelectedqty > 0 ? (
            <>
              <Text
                color={"gray.500"}
                fontSize="sm"
                marginX={6}
              >{`${formatEther(totalPayment)} FIL total session payment`}</Text>
              <Button minWidth={"220px"} onClick={onDecryptMultiple}>
                <Text>{`${`Decrypt selected ${rowSelectedqty} data set${
                  rowSelectedqty > 1 ? "s" : ""
                }`}`}</Text>
              </Button>
            </>
          ) : null}
        </Flex>
        <Box overflowY="auto" maxHeight="60vh">
          <Table
            colorScheme="gray"
            overflow="hidden"
            borderRadius="lg"
            borderBottom="2px solid white"
          >
            <Thead bgColor="#E6EDF9">
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody bgColor="white" fontSize="sm">
              {table.getRowModel().rows.map((row: Row<Item>) => {
                return (
                  <Tr
                    key={row.id}
                    sx={{
                      _hover: {
                        backgroundColor: "#F1F4F9",
                      },
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, {
                          ...cell.getContext(),
                        })}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </TableContainer>

      <DecryptionModal
        isOpen={tokensToDecrypt.length > 0}
        onClose={onCloseDecryptModal}
        tokenInfos={tokensToDecrypt}
      />
    </>
  );
}
