<?php

/**
 * src/Entity/User.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\ACiencia\Entity;

use DateTime;
use Doctrine\ORM\Mapping as ORM;
use InvalidArgumentException;
use JetBrains\PhpStorm\ArrayShape;
use JsonSerializable;
use Stringable;
use ValueError;

#[ORM\Entity, ORM\Table(name: "user")]
#[ORM\UniqueConstraint(name: "IDX_UNIQ_USERNAME", columns: [ "username" ])]
#[ORM\UniqueConstraint(name: "IDX_UNIQ_EMAIL", columns: [ "email" ])]
class User implements JsonSerializable, Stringable
{
    #[ORM\Column(
        name: "id",
        type: "integer",
        nullable: false
    )]
    #[ORM\Id(), ORM\GeneratedValue(strategy: "IDENTITY")]
    protected int $id;

    #[ORM\Column(
        name: "username",
        type: "string",
        length: 32,
        unique: true,
        nullable: false
    )]
    protected string $username;

    #[ORM\Column(
        name: "email",
        type: "string",
        length: 60,
        unique: true,
        nullable: false
    )]
    protected string $email;

    #[ORM\Column(
        name: "password",
        type: "string",
        length: 60,
        nullable: false
    )]
    protected string $password_hash;

    #[ORM\Column(
        name: "role",
        type: "string",
        length: 10,
        nullable: false,
        enumType: Role::class
    )]
    protected Role $role;

    #[ORM\Column(
        name: "active",
        type: "boolean",
        nullable: false
    )]
    protected string $active;

    #[ORM\Column(
        name: "birth",
        type: "datetime",
        nullable: true
    )]
    protected DateTime | null $birth = null;

    #[ORM\Column(
        name: "nickname",
        type: "string",
        length: 32,
        nullable: true
    )]
    protected string $nickname;

    /**
     * User constructor.
     *
     * @param string $username username
     * @param string $email email
     * @param string $password password
     * @param Role|string $role Role::*
     * @param DateTime|null $birth birth
     * @param string|null $nickname nickname
     *
     * @throws InvalidArgumentException
     */
    public function __construct(
        string $username = '',
        string $email = '',
        string $password = '',
        Role|string $role = Role::READER,
        ?DateTime $birth = null,
        ?string $nickname = ""
    ) {
        $this->id       = 0;
        $this->username = $username;
        $this->email    = $email;
        $this->setPassword($password);
        $this->setRole($role);
        $this->active = true;
        $this->birth = $birth;
        $this->setNickname($nickname);
    }

    /**
     * @return int User id
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Get username
     *
     * @return string
     */
    public function getUsername(): string
    {
        return $this->username;
    }

    /**
     * Set username
     *
     * @param string $username username
     * @return void
     */
    public function setUsername(string $username): void
    {
        $this->username = $username;
    }

    /**
     * Get user e-mail
     *
     * @return string
     */
    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * Set user e-mail
     *
     * @param string $email email
     * @return void
     */
    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    /**
     * @param Role|string $role
     * @return bool
     */
    public function hasRole(Role|string $role): bool
    {
        if (!$role instanceof Role) {
            $role = Role::from($role);
        }
        return match ($role) {
            Role::READER => true,
            Role::WRITER => ($this->role === Role::WRITER),
            default => false
        };
    }

    /**
     * @param Role|string $newRole [ Role::READER | Role::WRITER | 'reader' | 'writer' ]
     * @return void
     * @throws InvalidArgumentException
     */
    public function setRole(Role|string $newRole): void
    {
        try {
            $this->role = ($newRole instanceof Role)
                ? $newRole
                : Role::from(strtolower($newRole));
        } catch (ValueError) {
            throw new InvalidArgumentException('Invalid Role');
        }
    }

    /**
     * Get user active
     *
     * @return string
     */
    public function getActive(): bool
    {
        return $this->active;
    }

    /**
     * Set user active
     *
     * @param bool $active active
     * @return void
     */
    public function setActive(bool $active): void
    {
        $this->active = $active;
    }

    /**
     * Get birth
     *
     * @return DateTime
     */
    final public function getBirth(): ?DateTime
    {
        return $this->birth;
    }

    /**
     * Set birth
     *
     * @param string $birth birth
     * @return void
     */
    final public function setBirth(?DateTime $birth): void
    {
        $this->birth = $birth;
    }

    /**
     * Get nickname
     *
     * @return string
     */
    public function getNickname(): string
    {
        return $this->nickname;
    }

    /**
     * Set nickname
     *
     * @param string $nickname nickname
     * @return void
     */
    public function setNickname(string $nickname): void
    {
        $this->nickname = $nickname;
    }

    /**
     * @return Role[] [ READER ] | [ READER , WRITER ]
     */
    public function getRoles(): array
    {
        $roles = array_filter(
            Role::cases(),
            fn($myRole) => $this->hasRole($myRole)
        );

        return $roles;
    }

    /**
     * Get the hashed password
     *
     * @return string
     */
    public function getPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * @param string $password password
     * @return void
     */
    public function setPassword(string $password): void
    {
        $this->password_hash = strval(password_hash($password, PASSWORD_DEFAULT));
    }

    /**
     * Verifies that the given hash matches the user password.
     *
     * @param string $password password
     * @return boolean
     */
    public function validatePassword(string $password): bool
    {
        return password_verify($password, $this->password_hash);
    }

    public function __toString(): string
    {
        return
            sprintf(
                '[%s: (id=%04d, username="%s", email="%s", role="%s", birth="%s", nickname="%s")]',
                basename(self::class),
                $this->getId(),
                $this->getUsername(),
                $this->getEmail(),
                $this->role->name,
                $this->getBirth()->format('!Y-m-d'),
                $this->getNickname()
            );
    }

    /**
     * @see JsonSerializable
     */
    #[ArrayShape(['user' => "array"])]
    public function jsonSerialize(): mixed
    {
        return [
            'user' => [
                'id' => $this->getId(),
                'username' => $this->getUsername(),
                'email' => $this->getEmail(),
                'role' => $this->role->name,
                'active' => $this->getActive(),
                'birth' => $this->getBirth()?->format('Y-m-d'),
                'nickname' => $this->getNickname()
            ]
        ];
    }
}
