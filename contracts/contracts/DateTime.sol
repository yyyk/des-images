// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// ----------------------------------------------------------------------------
// BokkyPooBah's DateTime Library v1.01
// https://github.com/bokkypoobah/BokkyPooBahsDateTimeLibrary
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2018-2019. The MIT Licence.
// ----------------------------------------------------------------------------

library DateTime {
    uint256 constant SECONDS_PER_DAY = 24 * 60 * 60;
    int256 constant OFFSET19700101 = 2440588;

    function isLeapYear(uint256 year) internal pure returns (bool leapYear) {
        leapYear = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }

    function getDaysInMonth(uint256 year, uint256 month)
        internal
        pure
        returns (uint256)
    {
        if (
            month == 1 ||
            month == 3 ||
            month == 5 ||
            month == 7 ||
            month == 8 ||
            month == 10 ||
            month == 12
        ) {
            return 31;
        } else if (month != 2) {
            return 30;
        } else {
            return isLeapYear(year) ? 29 : 28;
        }
    }

    function isValidDate(
        uint256 year,
        uint256 month,
        uint256 day
    ) internal pure returns (bool) {
        if (month > 0 && month <= 12) {
            uint256 daysInMonth = getDaysInMonth(year, month);
            if (day > 0 && day <= daysInMonth) {
                return true;
            }
        }
        return false;
    }

    function timestampFromDate(
        uint256 _year,
        uint256 _month,
        uint256 _day
    ) internal pure returns (uint256) {
        require(_year >= 1970);
        int256 year = int256(_year);
        int256 month = int256(_month);
        int256 day = int256(_day);

        int256 totalDays = day -
            32075 +
            (1461 * (year + 4800 + (month - 14) / 12)) /
            4 +
            (367 * (month - 2 - ((month - 14) / 12) * 12)) /
            12 -
            (3 * ((year + 4900 + (month - 14) / 12) / 100)) /
            4 -
            OFFSET19700101;

        return uint256(totalDays) * SECONDS_PER_DAY;
    }
}
