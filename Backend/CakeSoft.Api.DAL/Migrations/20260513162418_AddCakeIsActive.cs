using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeSoft.Api.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Cakes",
                type: "bit",
                nullable: false,
                defaultValue: true);
            // Set all existing cakes as active
            migrationBuilder.Sql("UPDATE [Cakes] SET [IsActive] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Cakes");
        }
    }
}
