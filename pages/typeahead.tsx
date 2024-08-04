import React, { EventHandler, KeyboardEventHandler, useRef, useState } from "react"
import { User } from "../types/types";

const usersList: User[] = [
    {
        name: "Jayz",
    },
    {
        name: "Ash",
    },
    {
        name: "Deep"
    },
    {
        name: "Yelena",
    },
    {
        name: "Eren"
    },
    {
        name: "Mikasa"
    },
    {
        name: "Armin"
    },
    {
        name: "JayzTheGoat"
    },
    {
        name: "Ashwin"
    },
    {
        name: "DeepXAshwin"
    }
];

const typeahead = () => {
    const [users, setUsers] = useState<User[]>(usersList);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [typeaheadValue, setTypeaheadValue] = useState<string>("");
    const textInput = useRef<HTMLInputElement>(null);
    // TODO: Either use tracked "users" or use tracked "displayedUsers"
    const [displayedUsers, setDisplayedUsers] = useState<User[]>(users);

    const onInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
        toggleSuggestionsDropdown();
        // if (isDropdownOpen) {
        //     document.querySelector('.suggestions-box')?.focus();
        // }
    }

    const toggleSuggestionsDropdown = () => {
        setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen);
    }

    const discardLastSelectedUser = () => {
        const lastSelectedUser  = selectedUsers && selectedUsers[-1];
        setDisplayedUsers((users) => [...users, lastSelectedUser]);
        setSelectedUsers((users) => users.filter(user => user.name !== lastSelectedUser.name));
    }

    const onSelectListItem = (selectedUser: User) => {
        setDisplayedUsers((users) => users.filter(user => user.name !== selectedUser.name));
        setSelectedUsers((users) => [...users, selectedUser]);
    }

    const onDeselectItem = (selectedUser: User) => {
        setDisplayedUsers((users) => [...users, selectedUser]);
        setSelectedUsers((users) => users.filter(user => user.name !== selectedUser.name));
    }

    const getUserswithMatchingName = (inputValue: string): User[] => {
        return users.filter((user) => (user.name.slice(0, inputValue.length) === inputValue)) || [];
    }

    const onTypeaheadInput = (event: React.ChangeEvent) => {
        const textInputValue = (event.target as HTMLInputElement).value;
        setTypeaheadValue(textInputValue);
        setDisplayedUsers(getUserswithMatchingName(textInputValue));
    }

    const onKeyUpInput = (event: React.KeyboardEvent) => {
        event.preventDefault();
        if (event.key === "Enter") {
            toggleSuggestionsDropdown();
        }
        if (!textInput.current.value && event.key === "Backspace") {
            const selected = document.querySelector(".selected-users-container .selected-user-item:last-of-type");
            (selected as HTMLElement)?.focus();
        }
    }

    const onSelectedItemKeyUp = (e: React.KeyboardEvent, user: User) => {
        if (e.key === "Backspace" && document.activeElement === (e.target)) {
            onDeselectItem(user);
            const selected = document.querySelector(".selected-users-container .selected-user-item:nth-last-of-type(2)");
            if (selected) {
                (selected as HTMLElement)?.focus();
            } else {
                (document.querySelector(".user-typeahead") as HTMLElement).focus();
            }
        }
    }

    const onKeyUpDisplayedItem = (e: React.KeyboardEvent, user: User) => {
        if (e.key === "Enter") {
            onSelectListItem(user);
        }
    }

    return (
        <>
        <div className="">
            {
                selectedUsers && 
                (
                    <div className="selected-users-container">
                        {selectedUsers.map((user, index) => {
                            return (
                                <div 
                                    className="selected-user-item"
                                    onKeyUp={(e) => onSelectedItemKeyUp(e, user)}
                                    key={user.name+index}
                                    tabIndex={0} //Use interactive HTML element instead
                                    onClick={() => onDeselectItem(user)}
                                >
                                    {user.name}
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div>
        <div className="">
            <input
                className="user-typeahead"
                ref={textInput}
                onKeyUp={onKeyUpInput}
                onClick={onInputClick}
                onChange={onTypeaheadInput}
                value={typeaheadValue}
                placeholder="Enter user name"/>
        </div>
        {
            isDropdownOpen &&
            (   
                <div className="suggestions-box">
                    <ul 
                    // onBlur={closeDropdown}
                    >
                        {
                            displayedUsers && 
                            displayedUsers.map((user: User) => {
                                    return (
                                        <li tabIndex={0} onClick={() => onSelectListItem(user)} onKeyUp={(e) => onKeyUpDisplayedItem(e, user)}>
                                            {user.name}
                                        </li>
                                    )
                            })
                        }
                    </ul>
                </div>
            )   
        }
        </>
    )
}

export default typeahead;
